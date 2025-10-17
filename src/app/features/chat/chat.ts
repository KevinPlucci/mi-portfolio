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
  CollectionReference,
} from '@angular/fire/firestore';

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

  // 👉 uid del usuario actual para el binding de clases
  meUid: string | null = this.auth.currentUser?.uid ?? null;

  messages$: Observable<ChatMessage[]> = collectionData<ChatMessage>(
    query(
      collection(this.fs, CHAT_COLLECTION) as CollectionReference<ChatMessage>,
      orderBy('createdAt', 'asc'),
      limit(200)
    ),
    { idField: 'id' }
  ).pipe(tap((messages) => console.log('🔥 Mensajes:', messages)));

  text = '';
  sending = signal(false);
  error = signal<string | null>(null);

  @ViewChild('messagesRef') private messagesRef?: ElementRef<HTMLDivElement>;
  private sub?: Subscription;

  ngAfterViewInit(): void {
    this.sub = this.messages$.subscribe(() => {
      queueMicrotask(() => {
        const el = this.messagesRef?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async send() {
    const t = this.text.trim();
    if (!t) return;
    if (t.length > 500) {
      this.error.set('El mensaje es demasiado largo (máx. 500).');
      return;
    }

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
      } as ChatMessage);
      this.text = '';
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo enviar el mensaje');
    } finally {
      this.sending.set(false);
    }
  }
}
