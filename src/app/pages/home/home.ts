import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';
import type { User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private auth = inject(Auth);
  private authService = inject(AuthService); // Inyectamos el servicio

  user$: Observable<User | null> = this.authService.user$;
  isAdmin$: Observable<boolean> = this.authService.isAdmin$;

  async logout() {
    await signOut(this.auth);
  }
}
