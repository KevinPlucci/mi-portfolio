import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class LogService {
  private db = inject(Firestore);

  /** Registra un login exitoso con email/uid y fecha */
  async loginSuccess(user: User) {
    const col = collection(this.db, 'loginLogs');
    await addDoc(col, {
      uid: user.uid,
      email: user.email ?? null,
      fechaIngreso: serverTimestamp(),
    });
  }
}
