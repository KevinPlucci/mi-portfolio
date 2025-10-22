import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp, // <--- CAMBIO: Importado desde @angular/fire
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

export type GameResult = {
  juego: string;
  puntos: number;
  detalles?: any;
  uid: string;
  email: string | null;
  createdAt: any;
};

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  async save(juego: string, puntos: number, detalles?: any) {
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    if (!user) return;

    await addDoc(collection(this.fs, 'resultados'), {
      juego,
      puntos,
      detalles: detalles ?? null,
      uid: user.uid,
      email: user.email ?? null,
      createdAt: serverTimestamp(),
    } satisfies GameResult);
  }
}
