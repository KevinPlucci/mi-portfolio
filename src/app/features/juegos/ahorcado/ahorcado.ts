import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingService } from '../../../core/ranking.service';
import { ResultsService } from '../../../core/results.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AhorcadoComponent {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);

  private palabras = [
    'ANGULAR',
    'FIREBASE',
    'COMPONENTE',
    'SERVICIO',
    'ESCALABILIDAD',
    'TEMPLATES',
    'ENRUTADOR',
    'OPTIMIZACION',
    'PORTAFOLIO',
    'SUSCRIPCION',
  ];

  palabra = '';
  elegidas = new Set<string>();
  errores = 0;
  maxErrores = 6;
  gano = false;
  perdio = false;

  constructor() {
    this.nuevaPartida();
  }

  nuevaPartida(): void {
    this.palabra = this.randomWord();
    this.elegidas.clear();
    this.errores = 0;
    this.gano = false;
    this.perdio = false;
  }

  elegir(letra: string): void {
    if (this.gano || this.perdio) return;
    const l = letra.toUpperCase();
    if (this.elegidas.has(l)) return;

    this.elegidas.add(l);

    if (!this.palabra.includes(l)) {
      this.errores++;
      if (this.errores >= this.maxErrores) {
        this.perdio = true;
        // resultado: pérdida
        this.results
          .save('ahorcado', 0, { palabra: this.palabra, errores: this.errores })
          .catch(console.error);
        this.ranking.addPoints(0).catch(console.error);
      }
    } else if (this.completa()) {
      this.gano = true;
      // resultado: victoria
      this.results
        .save('ahorcado', 1, { palabra: this.palabra, errores: this.errores })
        .catch(console.error);
      this.ranking.addPoints(1).catch(console.error);
    }
  }

  get mascara(): string {
    return this.palabra
      .split('')
      .map((c) => (this.elegidas.has(c) ? c : ' _ '))
      .join('');
  }

  get abecedario(): string[] {
    return 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  }

  private completa(): boolean {
    for (const c of this.palabra) if (!this.elegidas.has(c)) return false;
    return true;
  }

  private randomWord(): string {
    const i = Math.floor(Math.random() * this.palabras.length);
    return this.palabras[i];
  }
}
