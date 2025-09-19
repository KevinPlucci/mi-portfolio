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
  /* inyectá con inject(AuthService) */
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  okMsg = '';

  async registrar() {
    this.error = '';
    this.okMsg = '';
    try {
      await this.auth.register(this.email, this.password);
      this.okMsg = 'Usuario creado. Redirigiendo…';
      this.router.navigateByUrl('/');
    } catch (e: any) {
      this.error =
        e?.code === 'auth/email-already-in-use'
          ? 'El usuario ya está registrado.'
          : e?.code === 'auth/weak-password'
          ? 'La contraseña es muy débil.'
          : 'No se pudo registrar.';
    }
  }
}
