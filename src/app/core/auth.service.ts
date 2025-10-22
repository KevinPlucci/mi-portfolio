import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User, // Asegúrate de que User esté importado
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore'; // Añadido
import { environment } from '../../environments/environment';
import { LogService } from './log.service';
import { Observable, from, of } from 'rxjs'; // Añadido
import { map, switchMap, shareReplay } from 'rxjs/operators'; // Añadido

type DemoKey = keyof typeof environment.demoUsers;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private logs = inject(LogService);
  private fs = inject(Firestore); // Añadido

  // stream del usuario logueado (sin cambios)
  user$: Observable<User | null> = authState(this.auth);

  // --- NUEVA LÓGICA DE ADMIN ---
  isAdmin$: Observable<boolean> = this.user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(false);
      }
      return from(this.checkAdmin(user));
    }),
    shareReplay(1) // Cachea el resultado para no recalcular en cada suscripción
  );

  private async checkAdmin(user: User): Promise<boolean> {
    const email = user.email ?? '';

    // 1. Check against environment emails
    const byEmail =
      Array.isArray(environment.adminEmails) &&
      environment.adminEmails.includes(email);
    if (byEmail) return true;

    // 2. Check for admin claim in token
    try {
      const token = await user.getIdTokenResult();
      if (token?.claims?.['admin'] === true) return true;
    } catch {
      /* Ignore token errors */
    }

    // 3. Check for admin document in Firestore
    try {
      const snap = await getDoc(doc(this.fs, 'admins', user.uid));
      if (snap.exists()) return true;
    } catch {
      /* Ignore Firestore errors */
    }

    return false;
  }
  // --- FIN DE LÓGICA DE ADMIN ---

  // --- MÉTODOS EXISTENTES (SIN CAMBIOS) ---
  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.logs.logLoginSuccess(cred.user);
    return cred.user;
  }

  async loginDemo(kind: DemoKey) {
    const creds = environment.demoUsers[kind];
    const user = await this.login(creds.email, creds.password);
    return user;
  }

  async register(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    await this.router.navigateByUrl('/home');
    return cred.user;
  }

  async logout() {
    await signOut(this.auth);
    await this.router.navigateByUrl('/home');
  }
}
