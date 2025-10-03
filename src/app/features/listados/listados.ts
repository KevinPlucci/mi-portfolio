import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

type Fila = {
  id?: string;
  uid: string;
  email: string | null;
  puntos: number;
  updatedAt?: any;
};

// Cambiá el nombre si tu colección no es 'ranking'
const COLECCION = 'ranking';

@Component({
  selector: 'app-listados',
  standalone: true,
  // 👇 Necesario para usar @for/@if (CommonModule) y el pipe | async (AsyncPipe)
  imports: [CommonModule, AsyncPipe],
  templateUrl: './listados.html',
  styleUrls: ['./listados.scss'],
})
export class ListadosComponent {
  private fs = inject(Firestore);

  top$: Observable<Fila[]> = collectionData(
    query(collection(this.fs, COLECCION), orderBy('puntos', 'desc'), limit(20)),
    { idField: 'id' }
  ) as Observable<Fila[]>;
}
