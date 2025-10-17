import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { increment, serverTimestamp } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  async addPoints(points: number) {
    // evitar this.auth.currentUser — tomamos el usuario del stream tipado
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    if (!user) return;

    const ref = doc(this.fs, 'ranking', user.uid);
    await setDoc(
      ref,
      {
        uid: user.uid,
        email: user.email ?? null,
        puntos: increment(points),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}
