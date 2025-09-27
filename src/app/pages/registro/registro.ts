import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  async register() {
    this.error = '';
    this.success = '';
    this.loading = true;
    try {
      await this.auth.register(this.email, this.password);
      // createUser deja al usuario autenticado → redirige a Home
      this.success = 'Usuario creado con éxito. Redirigiendo...';
      this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.error =
        e?.code === 'auth/email-already-in-use'
          ? 'El usuario ya se encuentra registrado.'
          : e?.code === 'auth/invalid-email'
          ? 'El email no es válido.'
          : e?.code === 'auth/weak-password'
          ? 'La contraseña es demasiado débil.'
          : 'No se pudo registrar el usuario.';
    } finally {
      this.loading = false;
    }
  }
}
