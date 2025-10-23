import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importar RouterLink para la navegación
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  limit,
  getDocs, // Para leer todos los docs a borrar
  writeBatch, // Para borrar en un solo lote
  doc, // Para obtener la referencia al doc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// Definición del tipo para los juegos jugados
type Jugados = {
  ahorcado: boolean;
  mayorMenor: boolean;
  preguntados: boolean;
  secuencias: boolean;
};

// Definición del tipo para la encuesta
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
  juegoFavorito: string;
  sugerenciaJuego?: string;
  createdAt?: any;
};

@Component({
  selector: 'app-encuesta-respuestas',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añadir RouterLink a los imports
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

  /**
   * Convierte el objeto de juegos jugados a un string legible.
   */
  jugadosToText(j?: Jugados): string {
    if (!j) return '';
    const out: string[] = [];
    if (j.ahorcado) out.push('Ahorcado');
    if (j.mayorMenor) out.push('Mayor/Menor');
    if (j.preguntados) out.push('Preguntados');
    if (j.secuencias) out.push('Secuencias');
    return out.join(', ') || 'Ninguno';
  }

  /**
   * Borra todas las encuestas de la colección.
   * Pide confirmación antes de proceder.
   */
  async borrarEncuestas() {
    // 1. Pedir confirmación al usuario
    const confirmacion = confirm(
      '¿Estás seguro de que quieres borrar TODAS las respuestas de la encuesta? Esta acción no se puede deshacer.'
    );

    if (!confirmacion) {
      return; // El usuario canceló la acción
    }

    // 2. Proceder con el borrado
    try {
      const ref = collection(this.fs, 'encuestas');
      const querySnapshot = await getDocs(ref);
      const batch = writeBatch(this.fs);

      // Añadir cada documento al lote de borrado
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Ejecutar el lote para borrar todo de una vez
      await batch.commit();
      console.log('Todas las encuestas han sido borradas exitosamente.');
    } catch (error) {
      console.error('Error al borrar las encuestas:', error);
      alert('Ocurrió un error al intentar borrar las respuestas.');
    }
  }
}
