import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {
  // Inyectamos el servicio para usar user$ en el template y hacer logout
  public auth = inject(AuthService);

  loadingLogout = false;

  async logout() {
    if (this.loadingLogout) return;
    this.loadingLogout = true;
    try {
      await this.auth.logout(); // asumiendo que tu AuthService expone logout()
      // si querés redirigir, podés hacerlo desde AuthService o aquí con Router
    } catch (err) {
      console.error(err);
    } finally {
      this.loadingLogout = false;
    }
  }
}
