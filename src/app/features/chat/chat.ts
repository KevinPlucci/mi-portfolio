// src/app/features/chat/chat.ts
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
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  CollectionReference, // <-- 1. IMPORTAR ESTO
} from '@angular/fire/firestore';

// Importamos 'tap' para "espiar" el observable
import { Observable, Subscription, tap } from 'rxjs';

type ChatMessage = {
  id?: string;
  uid: string;
  email: string | null;
  text: string;
  createdAt: any;
};

const CHAT_COLLECTION = 'chatMessages';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  messages$: Observable<ChatMessage[]> = collectionData<ChatMessage>(
    query(
      // 2. AÑADIR LA CONVERSIÓN DE TIPO AQUÍ -->
      collection(this.fs, CHAT_COLLECTION) as CollectionReference<ChatMessage>,
      orderBy('createdAt', 'asc'),
      limit(200)
    ),
    { idField: 'id' }
  ).pipe(
    tap((messages) => {
      console.log('🔥 Mensajes recibidos desde Firestore:', messages);
    })
  );

  text = '';
  sending = signal(false);
  error = signal<string | null>(null);

  @ViewChild('messagesRef') private messagesRef?: ElementRef<HTMLDivElement>;
  private sub?: Subscription;

  ngAfterViewInit(): void {
    console.log('📬 Suscribiéndose a los mensajes...');
    this.sub = this.messages$.subscribe((messages) => {
      console.log(
        '📦 La suscripción ha recibido una actualización. Número de mensajes:',
        messages.length
      );
      queueMicrotask(() => {
        const el = this.messagesRef?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  ngOnDestroy(): void {
    console.log('🗑️ Dando de baja la suscripción a los mensajes.');
    this.sub?.unsubscribe();
  }

  async send() {
    const t = this.text.trim();

    if (!t) return;
    if (t.length > 500) {
      this.error.set('El mensaje es demasiado largo (máx. 500 caracteres).');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      console.error(
        '⛔ Error: Intento de enviar mensaje sin usuario autenticado.'
      );
      this.error.set('Debes iniciar sesión para chatear.');
      return;
    }

    console.log('▶️ Iniciando envío de mensaje...');
    try {
      this.sending.set(true);
      this.error.set(null);

      const messagePayload = {
        uid: user.uid,
        email: user.email,
        text: t,
        createdAt: serverTimestamp(),
      };

      console.log('📤 Enviando payload a Firestore:', messagePayload);

      await addDoc(
        collection(this.fs, CHAT_COLLECTION),
        messagePayload as ChatMessage
      );

      console.log('✅ Mensaje enviado con éxito.');
      this.text = '';
    } catch (e: any) {
      console.error('❌ Error al enviar el mensaje a Firestore:', e);
      this.error.set(e?.message ?? 'No se pudo enviar el mensaje');
    } finally {
      console.log('⏹️ Finalizando proceso de envío.');
      this.sending.set(false);
    }
  }
}
