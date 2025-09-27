import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  form: any;
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  usarInvitado() {
    throw new Error('Method not implemented.');
  }
  usarDemo() {
    throw new Error('Method not implemented.');
  }
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  async login() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.login(
        this.email,
        this.password /* validar contra Firebase */
      );
      this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.error =
        e?.code === 'auth/invalid-credential'
          ? 'Usuario o contraseña inválidos.'
          : e?.code === 'auth/user-not-found'
          ? 'El usuario no existe.'
          : e?.code === 'auth/invalid-email'
          ? 'El email no es válido.'
          : e?.code === 'auth/too-many-requests'
          ? 'Demasiados intentos; probá más tarde.'
          : 'No se pudo iniciar sesión.';
    } finally {
      this.loading = false;
    }
  }

  // Accesos rápidos: completan y loguean contra Firebase (estos usuarios deben existir)
  accesoDemo() {
    const { demo } = environment.demoUsers;
    this.email = demo.email;
    this.password = demo.password;
    this.login();
  }

  accesoInvitado() {
    const { invitado } = environment.demoUsers;
    this.email = invitado.email;
    this.password = invitado.password;
    this.login();
  }
}
