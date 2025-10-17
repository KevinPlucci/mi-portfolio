import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { LogService } from '../../core/log.service';
import { environment } from '../../../environments/environment';

type DemoKey = keyof typeof environment.demoUsers;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // 👈 AQUI
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private logger = inject(LogService);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value as {
      email: string;
      password: string;
    };

    try {
      this.loading = true;
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      await this.logger.logLoginSuccess(cred.user);
      await this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.error =
        this.mapAuthError(e?.code) ??
        (e?.message || 'No se pudo iniciar sesión');
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  quickFill(kind: DemoKey) {
    const creds = environment.demoUsers[kind];
    this.form.patchValue({ email: creds.email, password: creds.password });
  }

  private mapAuthError(code?: string): string | null {
    switch (code) {
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/too-many-requests':
        return 'Demasiados intentos, probá más tarde';
      default:
        return null;
    }
  }
}
