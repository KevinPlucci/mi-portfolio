import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // 👈 AQUI
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  loading = false;
  error: string | null = null;
  ok = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    this.error = null;
    this.ok = false;
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
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.ok = true;
      await this.router.navigateByUrl('/home'); // auto-login + redirección
    } catch (e: any) {
      this.error =
        this.mapAuthError(e?.code) ?? (e?.message || 'No se pudo registrar');
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  private mapAuthError(code?: string): string | null {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El usuario ya está registrado';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil';
      default:
        return null;
    }
  }
}
