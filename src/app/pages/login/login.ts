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
    this.accesoInvitado();
  }
  usarDemo() {
    this.accesoDemo();
  }
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
      this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.error = e?.message ?? 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }

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
