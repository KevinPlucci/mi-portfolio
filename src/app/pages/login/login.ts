import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  /* inyectá con inject(AuthService) */
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  async login() {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigateByUrl('/');
    } catch {
      this.error = 'Email o contraseña inválidos.';
    } finally {
      this.loading = false;
    }
  }

  usarDemo() {
    this.email = 'demo@alumno.com';
    this.password = '123456';
    this.login();
  }
  usarInvitado() {
    this.email = 'invitado@demo.com';
    this.password = 'guest123';
    this.login();
  }
}
