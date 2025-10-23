import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importamos RouterModule para routerLink en HTML
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  limit,
  where,
  getDocs, // Para obtener documentos antes de borrar
  writeBatch, // Para borrar en lotes
  WriteBatch, // Tipo WriteBatch
  QuerySnapshot, // Tipo QuerySnapshot
} from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service'; // Importamos AuthService

// Interfaces (Asegúrate de que coincidan con tus datos en Firestore)
type Rank = {
  id?: string; // idField lo añade
  uid: string;
  email: string | null;
  puntos: number;
  updatedAt?: any; // Timestamp de Firestore
};
type Result = {
  id?: string; // idField lo añade
  uid: string;
  email: string | null;
  juego: string;
  puntos: number;
  createdAt?: any; // Timestamp de Firestore
  detalles?: any;
};

@Component({
  selector: 'app-listados',
  standalone: true,
  // Asegúrate de importar DatePipe y RouterModule aquí
  imports: [CommonModule, AsyncPipe, DatePipe, RouterModule],
  templateUrl: './listados.html',
  styleUrls: ['./listados.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadosComponent {
  private fs: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService); // Inyectamos AuthService

  // Observable para saber si el usuario es admin
  isAdmin$: Observable<boolean> = this.authService.isAdmin$;

  // Observables para los datos
  rankingGeneral$: Observable<Rank[]>;
  resultadosRecientes$: Observable<Result[]>;
  topAhorcado$: Observable<Result[]>;
  topMayorMenor$: Observable<Result[]>;
  topPreguntados$: Observable<Result[]>;
  topSecuencias$: Observable<Result[]>;

  constructor() {
    // Ranking General: Ordenado por puntos DESC, limitado a 50 (puedes ajustar)
    this.rankingGeneral$ = collectionData(
      query(
        collection(this.fs, 'ranking'),
        orderBy('puntos', 'desc'),
        limit(50)
      ),
      { idField: 'id' }
    ) as Observable<Rank[]>;

    // Resultados Recientes: Ordenado por fecha DESC, limitado a 5
    this.resultadosRecientes$ = collectionData(
      query(
        collection(this.fs, 'resultados'),
        orderBy('createdAt', 'desc'),
        limit(5) // Limitamos a 5
      ),
      { idField: 'id' }
    ) as Observable<Result[]>;

    // Función para obtener Top 3 de un juego específico
    const getTop3 = (juegoNombre: string): Observable<Result[]> => {
      return collectionData(
        query(
          collection(this.fs, 'resultados'),
          where('juego', '==', juegoNombre),
          orderBy('puntos', 'desc'), // Ordenar por puntos
          limit(3) // Limitar a 3
        ),
        { idField: 'id' }
      ) as Observable<Result[]>;
    };

    // Obtenemos Top 3 para cada juego
    this.topAhorcado$ = getTop3('ahorcado');
    this.topMayorMenor$ = getTop3('mayor-menor');
    this.topPreguntados$ = getTop3('preguntados');
    this.topSecuencias$ = getTop3('secuencias');
  }

  // --- Métodos de Borrado (Actualizados) ---

  /** Borra TODOS los documentos de la colección 'ranking'. SOLO ADMIN. */
  async clearRanking(): Promise<void> {
    const isAdmin = await firstValueFrom(this.isAdmin$.pipe(take(1)));
    if (!isAdmin) {
      console.error(
        'Acción no permitida. Se requieren permisos de administrador.'
      );
      return;
    }
    // Usamos window.confirm para una confirmación simple
    if (
      !window.confirm(
        '¿Estás seguro de que quieres borrar TODO el Ranking General? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    console.log('Limpiando Ranking General (Admin)...');
    await this.deleteCollection('ranking', 'Ranking General');
  }

  /** Borra los últimos 5 resultados mostrados (o todos si son menos de 5). SOLO ADMIN. */
  async clearRecent(): Promise<void> {
    const isAdmin = await firstValueFrom(this.isAdmin$.pipe(take(1)));
    if (!isAdmin) {
      console.error(
        'Acción no permitida. Se requieren permisos de administrador.'
      );
      return;
    }
    if (
      !window.confirm(
        '¿Estás seguro de que quieres borrar los Últimos 5 Resultados mostrados?'
      )
    ) {
      return;
    }

    console.log('Limpiando Últimos 5 Resultados (Admin)...');
    const resultsCollection = collection(this.fs, 'resultados');
    // Obtenemos los mismos 5 documentos que muestra la tabla
    const q = query(resultsCollection, orderBy('createdAt', 'desc'), limit(5));
    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log('No hay resultados recientes para borrar.');
        return;
      }
      const batch = writeBatch(this.fs);
      snapshot.docs.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
      await batch.commit();
      console.log('Últimos 5 Resultados limpiados con éxito.');
    } catch (error) {
      console.error('Error al limpiar los Últimos 5 Resultados:', error);
      alert('Error al limpiar los Últimos 5 Resultados. Revisa la consola.');
    }
  }

  /** Borra los Top 3 resultados de un juego específico. SOLO ADMIN. */
  async clearGameTop3(gameName: string): Promise<void> {
    const isAdmin = await firstValueFrom(this.isAdmin$.pipe(take(1)));
    if (!isAdmin) {
      console.error(
        'Acción no permitida. Se requieren permisos de administrador.'
      );
      return;
    }
    if (
      !window.confirm(
        `¿Estás seguro de que quieres borrar el Top 3 de '${gameName}'?`
      )
    ) {
      return;
    }

    console.log(`Limpiando Top 3 de ${gameName} (Admin)...`);
    const resultsCollection = collection(this.fs, 'resultados');
    // Obtenemos los mismos 3 documentos que muestra la tabla
    const q = query(
      resultsCollection,
      where('juego', '==', gameName),
      orderBy('puntos', 'desc'),
      limit(3)
    );
    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log(`No hay resultados Top 3 para '${gameName}'.`);
        return;
      }
      const batch = writeBatch(this.fs);
      snapshot.docs.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
      await batch.commit();
      console.log(`Top 3 de ${gameName} limpiado con éxito.`);
    } catch (error) {
      console.error(`Error al limpiar el Top 3 de ${gameName}:`, error);
      alert(`Error al limpiar el Top 3 de ${gameName}. Revisa la consola.`);
    }
  }

  /** Borra TODAS las colecciones (Ranking y Resultados). SOLO ADMIN. */
  async clearAll(): Promise<void> {
    const isAdmin = await firstValueFrom(this.isAdmin$.pipe(take(1)));
    if (!isAdmin) {
      console.error(
        'Acción no permitida. Se requieren permisos de administrador.'
      );
      return;
    }
    // Confirmación más seria
    if (
      !window.confirm(
        '¡¡¡ATENCIÓN!!! ¿Estás ABSOLUTAMENTE SEGURO de borrar TODOS los datos de Ranking y Resultados? ¡ESTA ACCIÓN ES IRREVERSIBLE!'
      )
    ) {
      return;
    }

    console.log('Limpiando TODAS las tablas (Admin)...');
    try {
      // Borramos ambas colecciones completas
      await Promise.all([
        this.deleteCollection('ranking', 'Ranking General'),
        this.deleteCollection('resultados', 'Resultados'),
      ]);
      console.log('Todas las tablas limpiadas con éxito.');
    } catch (error) {
      console.error('Error al limpiar todas las tablas:', error);
      alert('Error al limpiar todas las tablas. Revisa la consola.');
    }
  }

  // --- Helper para borrar colecciones (simplificado, puede ser lento para muchas docs) ---
  private async deleteCollection(
    collectionPath: string,
    collectionName: string
  ): Promise<void> {
    const collectionRef = collection(this.fs, collectionPath);
    const q = query(collectionRef); // Query sin límites para obtener todo
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`La colección '${collectionName}' ya está vacía.`);
      return;
    }

    // Borrar documentos en lotes de 500 (máximo por batch)
    let batch: WriteBatch | null = writeBatch(this.fs);
    let count = 0;
    for (const docSnapshot of snapshot.docs) {
      batch.delete(docSnapshot.ref);
      count++;
      if (count === 500) {
        await batch.commit();
        batch = writeBatch(this.fs); // Iniciar nuevo lote
        count = 0;
      }
    }
    // Commit del último lote si no estaba vacío
    if (count > 0) {
      await batch.commit();
    }
    console.log(`Colección '${collectionName}' limpiada.`);
  }

  // --- Navegación ---
  goHome(): void {
    this.router.navigate(['/home']);
  }
}
