import {
  Injectable,
  inject,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LogService } from './log.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private injector = inject(EnvironmentInjector);
  private logs = inject(LogService);

  /** Stream del usuario autenticado (o null). */
  readonly user$: Observable<User | null> = authState(this.auth);

  /**
   * Login contra Firebase (recomendado). Si usarDemo=true, emula login local (no recomendado para este sprint).
   */
  async login(
    email: string,
    password: string,
    usarDemo = false
  ): Promise<User | { email: string } | null> {
    if (usarDemo) {
      // (Se deja por compatibilidad, pero este sprint pide validar realmente contra Firebase)
      const { demo, invitado } = environment.demoUsers;
      const ok =
        (email === demo.email && password === demo.password) ||
        (email === invitado.email && password === invitado.password);

      if (ok) return { email } as any;
      throw new Error('DEMO_INVALID');
    }

    return runInInjectionContext(this.injector, async () => {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      // Log de inicio exitoso
      await this.logs.loginSuccess(cred.user);
      return cred.user;
    });
  }

  /** Crea usuario y queda autenticado */
  async register(email: string, password: string) {
    return runInInjectionContext(this.injector, async () => {
      const cred = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // Podrías opcionalmente registrar un log de "registro"
      return cred.user;
    });
  }

  logout() {
    return runInInjectionContext(this.injector, () => signOut(this.auth));
  }

  isDemoCredential(email: string, password: string): boolean {
    const { demo, invitado } = environment.demoUsers;
    return (
      (email === demo.email && password === demo.password) ||
      (email === invitado.email && password === invitado.password)
    );
  }
}
