import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common'; // Agregamos DatePipe
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Importamos Router y RouterModule

import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  CollectionReference,
  getDocs, // Para obtener docs antes de borrar
  writeBatch, // Para borrar en lotes
  WriteBatch, // Tipo WriteBatch
  QuerySnapshot, // Tipo QuerySnapshot (No necesario importar explícitamente)
} from '@angular/fire/firestore';
import { Observable, Subscription, tap, firstValueFrom } from 'rxjs'; // Importamos firstValueFrom
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service'; // Importamos AuthService

type ChatMessage = {
  id?: string;
  uid: string;
  email: string | null;
  text: string;
  createdAt: any; // Firestore Timestamp
};

const CHAT_COLLECTION = 'chatMessages';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, RouterModule, DatePipe], // Añadimos RouterModule y DatePipe
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  private fs = inject(Firestore);
  private auth = inject(Auth);
  private authService = inject(AuthService); // Inyectamos AuthService
  private router = inject(Router); // Inyectamos Router

  // Observable para saber si es admin (para mostrar el botón Limpiar)
  isAdmin$: Observable<boolean> = this.authService.isAdmin$;

  // uid del usuario actual para el binding de clases
  meUid: string | null = this.auth.currentUser?.uid ?? null;

  // Observable de mensajes
  messages$: Observable<ChatMessage[]> = collectionData<ChatMessage>(
    query(
      collection(this.fs, CHAT_COLLECTION) as CollectionReference<ChatMessage>,
      orderBy('createdAt', 'asc'),
      limit(200)
    ),
    { idField: 'id' }
  ).pipe(
    tap(() => this.scrollToBottom()) // Scroll automático
  );

  text = ''; // Texto del input
  sending = signal(false); // Estado de envío
  error = signal<string | null>(null); // Mensaje de error

  @ViewChild('messagesRef') private messagesRef?: ElementRef<HTMLDivElement>;
  private sub?: Subscription;

  ngAfterViewInit(): void {
    // Suscripción para scroll inicial y continuado
    this.sub = this.messages$.subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe(); // Limpia la suscripción
  }

  /** Envía un mensaje a Firestore */
  async send() {
    const t = this.text.trim();
    if (!t || this.sending()) return;
    if (t.length > 500) {
      this.error.set('El mensaje es demasiado largo (máx. 500).');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.error.set('Debes iniciar sesión para chatear.');
      return;
    }

    this.sending.set(true);
    this.error.set(null);

    try {
      await addDoc(collection(this.fs, CHAT_COLLECTION), {
        uid: user.uid,
        email: user.email,
        text: t,
        createdAt: serverTimestamp(),
      } as ChatMessage);
      this.text = ''; // Limpia el input
    } catch (e: any) {
      console.error('Error al enviar mensaje:', e);
      this.error.set(e?.message ?? 'No se pudo enviar el mensaje');
    } finally {
      this.sending.set(false);
    }
  }

  /** Borra TODOS los mensajes del chat. SOLO ADMIN. */
  async clearChat(): Promise<void> {
    const isAdmin = await firstValueFrom(this.isAdmin$.pipe(take(1)));
    if (!isAdmin) {
      console.error(
        'Acción no permitida. Se requieren permisos de administrador.'
      );
      // Opcional: Mostrar mensaje al usuario
      // this.error.set("No tienes permisos para limpiar el chat.");
      return;
    }
    // Usamos window.confirm para pedir confirmación
    if (
      !window.confirm(
        '¿Estás seguro de que quieres borrar TODOS los mensajes del chat? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    console.log('Limpiando Chat (Admin)...');
    try {
      await this.deleteCollection(CHAT_COLLECTION, 'Chat');
      console.log('Chat limpiado con éxito.');
      // Opcional: Mostrar un mensaje temporal de éxito
    } catch (error) {
      console.error('Error al limpiar el chat:', error);
      alert('Error al limpiar el chat. Revisa la consola para más detalles.');
      this.error.set('Error al limpiar el chat.');
    }
  }

  // --- Helper para borrar colecciones (reutilizado) ---
  private async deleteCollection(
    collectionPath: string,
    collectionName: string
  ): Promise<void> {
    const collectionRef = collection(this.fs, collectionPath);
    const q = query(collectionRef);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`La colección '${collectionName}' ya está vacía.`);
      return;
    }

    let batch: WriteBatch | null = writeBatch(this.fs);
    let count = 0;
    for (const docSnapshot of snapshot.docs) {
      if (!batch) batch = writeBatch(this.fs); // Asegura que batch no sea null
      batch.delete(docSnapshot.ref);
      count++;
      if (count === 500) {
        await batch.commit();
        batch = null; // Reinicia batch a null para el siguiente lote
        count = 0;
      }
    }
    if (count > 0 && batch) {
      await batch.commit();
    }
    console.log(`Colección '${collectionName}' limpiada.`);
  }

  /** Navega a la página de Home */
  goHome(): void {
    this.router.navigate(['/home']);
  }

  /** Hace scroll al final del contenedor de mensajes */
  private scrollToBottom(): void {
    queueMicrotask(() => {
      const el = this.messagesRef?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
