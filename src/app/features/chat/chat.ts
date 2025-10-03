import { Component, inject, signal } from '@angular/core';
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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
  imports: [CommonModule, FormsModule, AsyncPipe], // 👈 importa AsyncPipe
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class ChatComponent {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  messages$: Observable<ChatMessage[]> = collectionData(
    query(
      collection(this.fs, CHAT_COLLECTION),
      orderBy('createdAt', 'asc'),
      limit(200)
    ),
    { idField: 'id' }
  ) as Observable<ChatMessage[]>;

  text = '';
  sending = signal(false);
  error = signal<string | null>(null);

  async send() {
    const t = this.text.trim();
    if (!t) return;
    const user = this.auth.currentUser;
    if (!user) {
      this.error.set('Debes iniciar sesión para chatear.');
      return;
    }

    try {
      this.sending.set(true);
      this.error.set(null);

      await addDoc(collection(this.fs, CHAT_COLLECTION), {
        uid: user.uid,
        email: user.email,
        text: t,
        createdAt: serverTimestamp(),
      } satisfies ChatMessage);

      this.text = '';
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo enviar el mensaje');
      console.error(e);
    } finally {
      this.sending.set(false);
    }
  }
}
