import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  user$: Observable<User | null> = authState(this.auth);

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await addDoc(collection(this.db, 'loginLogs'), {
      uid: cred.user.uid,
      email: cred.user.email,
      ts: serverTimestamp(),
    });
    return cred.user;
  }

  async register(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  logout() {
    return signOut(this.auth);
  }
}
