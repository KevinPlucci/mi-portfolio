import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import type { User } from 'firebase/auth';

async function checkAdmin(user: User, fs: Firestore): Promise<boolean> {
  const email = user.email ?? '';

  const byEmail =
    Array.isArray(environment.adminEmails) &&
    environment.adminEmails.includes(email);

  let byClaim = false;
  try {
    const token = await user.getIdTokenResult();
    byClaim = token?.claims?.['admin'] === true;
  } catch {}

  let byDoc = false;
  try {
    const snap = await getDoc(doc(fs, 'admins', user.uid));
    byDoc = snap.exists();
  } catch {}

  return byEmail || byClaim || byDoc;
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);
  const fs = inject(Firestore);

  return authState(auth).pipe(
    take(1),
    switchMap((u) => {
      if (!u) return of(router.createUrlTree(['/home']));
      return from(checkAdmin(u, fs)).pipe(
        map((isAdmin) => (isAdmin ? true : router.createUrlTree(['/home'])))
      );
    })
  );
};
