import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {
  private authSvc = inject(AuthService);
  user$: Observable<User | null> = this.authSvc.user$;

  // Usado por el template con la nueva sintaxis @if
  auth = this.authSvc;

  async logout() {
    await this.authSvc.logout();
  }
}
