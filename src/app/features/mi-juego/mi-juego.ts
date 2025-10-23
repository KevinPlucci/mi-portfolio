import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnDestroy, // Importamos OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importamos Router y RouterModule
import { RankingService } from '../../core/ranking.service';
import { ResultsService } from '../../core/results.service';

// Tipo para la ronda
type Round = { series: number[]; correct: number; options: number[] };
// Tipos de secuencia
type SequenceType = 'arithmetic' | 'geometric' | 'fibonacci' | 'alternating';
// --- CAMBIO: Añadimos 'confirmReset' a los estados del juego ---
type GameState =
  | 'playing'
  | 'showingResult'
  | 'askReplay'
  | 'finished'
  | 'loading'
  | 'confirmReset'; // <-- AÑADIDO

const ROUNDS_CONST = 10;

@Component({
  selector: 'app-mi-juego',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mi-juego.html',
  styleUrls: ['./mi-juego.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiJuegoComponent implements OnDestroy {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);
  private router = inject(Router);

  // --- State como Signals ---
  round = signal(0);
  score = signal(0);
  picked = signal<number | undefined>(undefined);
  r = signal<Round | undefined>(undefined);
  gameState = signal<GameState>('loading');
  private previousGameState = signal<GameState>('loading'); // Para saber a dónde volver
  readonly ROUNDS = ROUNDS_CONST;

  constructor() {
    this.startNewRound();
  }

  ngOnDestroy(): void {
    this.resetState();
  }

  startNewRound(): void {
    this.picked.set(undefined);
    try {
      this.r.set(this.makeRound());
      this.gameState.set('playing');
    } catch (e) {
      console.error('Error generando ronda:', e);
      this.gameState.set('finished');
    }
  }

  makeRound(): Round {
    // ... (El resto de la lógica para crear rondas no cambia)
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
      default:
        return this.makeArithmeticSequence();
    }
  }

  // --- Generadores de Secuencias (SIN CAMBIOS) ---
  private makeArithmeticSequence(): Round {
    const a = this.rand(1, 20);
    const d = this.rand(2, 9);
    const series = [a, a + d, a + 2 * d, a + 3 * d];
    const correct = a + 4 * d;
    return this.buildRound(series, correct);
  }
  private makeGeometricSequence(): Round {
    const a = this.rand(1, 4);
    const r = this.rand(2, 3);
    const series = [a, a * r, a * r * r, a * r * r * r];
    const correct = a * r * r * r * r;
    if (correct > 200) return this.makeArithmeticSequence();
    return this.buildRound(series, correct);
  }
  private makeFibonacciSequence(): Round {
    const a = this.rand(1, 10);
    const b = this.rand(a + 1, a + 5);
    const n3 = a + b;
    const n4 = b + n3;
    const series = [a, b, n3, n4];
    const correct = n3 + n4;
    if (correct > 200) return this.makeArithmeticSequence();
    return this.buildRound(series, correct);
  }
  private makeAlternatingSequence(): Round {
    const a1 = this.rand(10, 20);
    const d1 = this.rand(1, 3);
    const a2 = this.rand(30, 40);
    const d2 = this.rand(4, 6);
    const series = [a1, a2, a1 + d1, a2 + d2];
    const correct = a1 + 2 * d1;
    if (correct > 200) return this.makeArithmeticSequence();
    return this.buildRound(series, correct);
  }
  private buildRound(series: number[], correct: number): Round {
    const opts = new Set<number>([correct]);
    let attempts = 0;
    while (opts.size < 4 && attempts < 20) {
      const deltaMagnitude = Math.max(1, Math.round(correct * 0.1));
      const delta =
        this.rand(-deltaMagnitude, deltaMagnitude) || this.rand(1, 3);
      const wrongOption = correct + delta;
      if (
        wrongOption > 0 &&
        !series.includes(wrongOption) &&
        wrongOption !== correct
      ) {
        opts.add(wrongOption);
      }
      attempts++;
    }
    while (opts.size < 4) {
      const filler =
        correct +
        (opts.size - (opts.has(correct) ? 1 : 0)) *
          (this.rand(0, 1) === 0 ? 1 : -1);
      if (filler > 0 && !opts.has(filler)) {
        opts.add(filler);
      } else {
        let fallbackOption = correct + 5 + opts.size;
        while (opts.has(fallbackOption) || fallbackOption <= 0) {
          fallbackOption++;
        }
        opts.add(fallbackOption);
      }
    }
    const options = this.shuffle([...opts]);
    return { series, correct, options };
  }

  pick(n: number): void {
    if (this.gameState() !== 'playing' || !this.r()) return;

    this.picked.set(n);
    if (n === this.r()!.correct) {
      this.score.update((s) => s + 1);
    }
    this.gameState.set('showingResult');
  }

  async next(): Promise<void> {
    if (this.gameState() !== 'showingResult') return;

    if (this.round() >= this.ROUNDS - 1) {
      this.gameState.set('finished');
      try {
        await Promise.all([
          this.ranking.addPoints(this.score()),
          this.results.save('secuencias', this.score(), {
            rounds: this.ROUNDS,
          }),
        ]);
        this.gameState.set('askReplay');
      } catch (e) {
        console.error('Error al guardar puntaje:', e);
        this.gameState.set('askReplay');
      }
    } else {
      this.round.update((r) => r + 1);
      this.startNewRound();
    }
  }

  /**
   * CAMBIO: Ahora no muestra un alert.
   * Guarda el estado actual y cambia al estado 'confirmReset'.
   */
  reset(): void {
    const currentState = this.gameState();
    if (currentState === 'playing' || currentState === 'showingResult') {
      this.previousGameState.set(currentState); // Guardamos el estado
      this.gameState.set('confirmReset'); // Activamos la confirmación
    }
  }

  /**
   * NUEVA FUNCIÓN: Maneja la respuesta del diálogo de confirmación.
   */
  handleResetChoice(confirm: boolean): void {
    if (this.gameState() !== 'confirmReset') return;

    if (confirm) {
      // Si el usuario confirma, resetea el juego.
      this.resetState();
      setTimeout(() => this.startNewRound(), 50);
    } else {
      // Si cancela, vuelve al estado en el que estaba.
      this.gameState.set(this.previousGameState());
    }
  }

  private resetState(): void {
    this.round.set(0);
    this.score.set(0);
    this.picked.set(undefined);
    this.r.set(undefined);
    this.gameState.set('loading');
  }

  handleReplayChoice(playAgain: boolean): void {
    if (this.gameState() !== 'askReplay') return;

    if (playAgain) {
      this.resetState();
      setTimeout(() => this.startNewRound(), 50);
    } else {
      this.goHome();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

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
