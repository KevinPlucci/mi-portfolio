import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingService } from '../../core/ranking.service';
import { ResultsService } from '../../core/results.service';

// El tipo de dato para cada ronda no cambia
type Round = { series: number[]; correct: number; options: number[] };

// Definimos los tipos de secuencias que podemos generar
type SequenceType = 'arithmetic' | 'geometric' | 'fibonacci' | 'alternating';

const ROUNDS = 10;

@Component({
  selector: 'app-mi-juego',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-juego.html',
  styleUrls: ['./mi-juego.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiJuegoComponent {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);

  // --- State como Signals ---
  round = signal(0);
  score = signal(0);
  picked = signal<number | undefined>(undefined);
  r = signal<Round | undefined>(undefined);
  finished = signal(false);

  constructor() {
    this.next(); // Inicia el juego al construir el componente
  }

  /** Genera una ronda con un tipo de secuencia aleatoria */
  makeRound(): Round {
    const sequenceTypes: SequenceType[] = [
      'arithmetic',
      'geometric',
      'fibonacci',
      'alternating',
    ];
    const type = sequenceTypes[this.rand(0, sequenceTypes.length - 1)];

    switch (type) {
      case 'geometric':
        return this.makeGeometricSequence();
      case 'fibonacci':
        return this.makeFibonacciSequence();
      case 'alternating':
        return this.makeAlternatingSequence();
      case 'arithmetic':
      default:
        return this.makeArithmeticSequence();
    }
  }

  // --- Generadores de Secuencias ---

  private makeArithmeticSequence(): Round {
    const a = this.rand(1, 20);
    const d = this.rand(2, 9); // Diferencia
    const series = [a, a + d, a + 2 * d, a + 3 * d];
    const correct = a + 4 * d;
    return this.buildRound(series, correct);
  }

  private makeGeometricSequence(): Round {
    const a = this.rand(1, 4);
    const r = this.rand(2, 3); // Razón
    const series = [a, a * r, a * r * r, a * r * r * r];
    const correct = a * r * r * r * r;
    return this.buildRound(series, correct);
  }

  private makeFibonacciSequence(): Round {
    const a = this.rand(1, 10);
    const b = this.rand(a + 1, a + 5);
    const series = [a, b, a + b, b + (a + b)];
    const correct = a + b + (b + (a + b));
    return this.buildRound(series, correct);
  }

  private makeAlternatingSequence(): Round {
    const a1 = this.rand(10, 20);
    const d1 = this.rand(1, 3);
    const a2 = this.rand(30, 40);
    const d2 = this.rand(4, 6);
    const series = [a1, a2, a1 + d1, a2 + d2, a1 + 2 * d1];
    const correct = a2 + 2 * d2;
    return this.buildRound(series, correct);
  }

  /** Construye el objeto Round con opciones aleatorias */
  private buildRound(series: number[], correct: number): Round {
    const opts = new Set<number>([correct]);
    while (opts.size < 4) {
      const delta = this.rand(-9, 9) || 1; // Elige un delta, si es 0, usa 1
      const wrongOption = correct + delta;
      if (wrongOption > 0) opts.add(wrongOption);
    }
    const options = this.shuffle([...opts]);
    return { series, correct, options };
  }

  /** Maneja la selección de una opción por parte del usuario */
  pick(n: number) {
    if (!this.r() || this.picked() !== undefined) return;
    this.picked.set(n);
    if (n === this.r()!.correct) {
      this.score.update((s) => s + 1);
    }
  }

  /** Pasa a la siguiente ronda o finaliza el juego */
  async next() {
    if (this.round() >= ROUNDS - 1 && !this.finished()) {
      this.finished.set(true);
      await Promise.all([
        this.ranking.addPoints(this.score()),
        this.results.save('secuencias', this.score(), { rounds: ROUNDS }),
      ]);
      return;
    }

    if (!this.finished()) {
      this.round.update((r) => r + 1);
      this.picked.set(undefined);
      this.r.set(this.makeRound());
    }
  }

  /** Reinicia el juego */
  reset() {
    this.round.set(0);
    this.score.set(0);
    this.picked.set(undefined);
    this.finished.set(false);
    this.r.set(this.makeRound());
  }

  // --- Helpers ---
  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffle<T>(a: T[]): T[] {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
