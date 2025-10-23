import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// Eliminamos imports relacionados con NavigationEnd, filter, map, signal
import { AuthService } from './core/auth.service';
// Eliminamos filter, map from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  private authSvc = inject(AuthService);
  // Eliminamos Router y signal

  auth = this.authSvc;
  year = new Date().getFullYear();

  // Eliminamos la señal isPageFixed y la lógica del constructor
  // que escuchaba los cambios de ruta

  constructor() {
    // El constructor vuelve a estar vacío (o como lo tenías antes)
  }

  async logout() {
    await this.authSvc.logout();
  }
}
