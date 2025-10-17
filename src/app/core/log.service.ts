import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class LogService {
  private fs = inject(Firestore);

  async logLoginSuccess(user: User) {
    try {
      await addDoc(collection(this.fs, 'loginLogs'), {
        uid: user.uid,
        email: user.email ?? null,
        fechaIngreso: serverTimestamp(),
      });
    } catch (e) {
      console.warn('No se pudo registrar el login:', e);
    }
  }
}
