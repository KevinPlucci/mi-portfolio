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

type Jugados = {
  ahorcado: boolean;
  mayorMenor: boolean;
  preguntados: boolean;
  secuencias: boolean;
};
type Encuesta = {
  id?: string;
  uid: string;
  email: string | null;
  nombre: string;
  edad: number;
  telefono: string;
  satisfaccion: string;
  jugados: Jugados;
  comentario: string;
  juegoFavorito: string; // Nuevo campo
  sugerenciaJuego?: string; // Nuevo campo (opcional)
  createdAt?: any;
};

@Component({
  selector: 'app-encuesta-respuestas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta-respuestas.html',
  styleUrls: ['./encuesta-respuestas.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncuestaRespuestasComponent {
  items$: Observable<Encuesta[]>;

  constructor(private fs: Firestore) {
    const ref = collection(this.fs, 'encuestas');
    this.items$ = collectionData(
      query(ref, orderBy('createdAt', 'desc'), limit(200)),
      { idField: 'id' }
    ) as Observable<Encuesta[]>;
  }

  jugadosToText(j?: Jugados): string {
    if (!j) return '';
    const out: string[] = [];
    if (j.ahorcado) out.push('Ahorcado');
    if (j.mayorMenor) out.push('Mayor/Menor');
    if (j.preguntados) out.push('Preguntados');
    if (j.secuencias) out.push('Secuencias');
    return out.join(', ') || 'Ninguno';
  }
}
