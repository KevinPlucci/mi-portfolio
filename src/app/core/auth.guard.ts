import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

/** Permite ruta solo si hay sesión; si no, redirige a /login */
export const authGuard: CanMatchFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const user = await firstValueFrom(authState(auth));
  return user ? true : router.createUrlTree(['/login']);
};
