import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { LogService } from './log.service';
import type { User } from 'firebase/auth';
import { Observable } from 'rxjs';

type DemoKey = keyof typeof environment.demoUsers;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private logs = inject(LogService);

  // stream del usuario logueado
  user$: Observable<User | null> = authState(
    this.auth
  ) as Observable<User | null>;

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
