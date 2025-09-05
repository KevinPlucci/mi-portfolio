import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private router: Router) {}

  async login() {
    this.loading = true;
    this.error = '';
    await new Promise((r) => setTimeout(r, 300));

    const ok = this.email === 'test@demo.com' && this.password === '1234';
    if (ok) {
      localStorage.setItem('auth', 'ok');
      this.router.navigateByUrl('/');
    } else {
      this.error = 'Credenciales inválidas';
    }

    this.loading = false;
  }
}
