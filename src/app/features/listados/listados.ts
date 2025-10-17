import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

type Rank = {
  uid: string;
  email: string | null;
  puntos: number;
  updatedAt?: any;
  id?: string;
};
type Result = {
  uid: string;
  email: string | null;
  juego: string;
  puntos: number;
  createdAt?: any;
  id?: string;
};

@Component({
  selector: 'app-listados',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe],
  templateUrl: './listados.html',
  styleUrls: ['./listados.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadosComponent {
  ranking$: Observable<Rank[]>;
  resultados$: Observable<Result[]>;

  constructor(private fs: Firestore) {
    this.ranking$ = collectionData(
      query(
        collection(this.fs, 'ranking'),
        orderBy('puntos', 'desc'),
        limit(50)
      ),
      { idField: 'id' }
    ) as Observable<Rank[]>;

    this.resultados$ = collectionData(
      query(
        collection(this.fs, 'resultados'),
        orderBy('createdAt', 'desc'),
        limit(50)
      ),
      { idField: 'id' }
    ) as Observable<Result[]>;
  }
}
