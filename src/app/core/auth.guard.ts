// src/app/core/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanMatchFn, CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

/**
 * Guard de autenticación para rutas protegidas usando `canMatch`.
 * Si no hay usuario logueado, redirige a /login.
 */
export const authGuard: CanMatchFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/login'])))
  );
};

/**
 * (Opcional) Versión equivalente para usar con `canActivate`.
 * Útil si alguna ruta prefiere canActivate en lugar de canMatch.
 */
export const authActivateGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/login'])))
  );
};
