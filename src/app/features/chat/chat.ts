import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface ChatMessage {
  id?: string;
  uid: string | null;
  email: string | null;
  text: string;
  createdAt: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class ChatComponent {
  private db = inject(Firestore);
  private auth = inject(Auth);

  messages$!: Observable<ChatMessage[]>;
  text = '';

  constructor() {
    const col = collection(this.db, 'chatMessages');
    const q = query(col, orderBy('createdAt', 'asc'), limit(200));
    this.messages$ = collectionData(q, { idField: 'id' }) as Observable<
      ChatMessage[]
    >;
  }

  async send() {
    const user = this.auth.currentUser;
    const trimmed = this.text.trim();
    if (!user || !trimmed) return;

    const col = collection(this.db, 'chatMessages');
    await addDoc(col, {
      uid: user.uid,
      email: user.email ?? null,
      text: trimmed,
      createdAt: serverTimestamp(),
    });
    this.text = '';
  }
}
