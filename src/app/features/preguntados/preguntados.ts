import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntadosService, Question } from './preguntados.service';
// Inyectamos los servicios para guardar el puntaje
import { RankingService } from '../../core/ranking.service';
import { ResultsService } from '../../core/results.service';

const ROUNDS = 10;

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntadosComponent {
  private api = inject(PreguntadosService);
  // Inyectamos los servicios
  private ranking = inject(RankingService);
  private results = inject(ResultsService);

  loading = signal(true);
  round = signal(0);
  score = signal(0);
  q = signal<Question | undefined>(undefined);
  picked = signal<string | undefined>(undefined);
  finished = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.nextQuestion(true);
  }

  async nextQuestion(first = false) {
    if (!first && this.round() >= ROUNDS - 1) {
      this.finished.set(true);

      // --- ¡LÓGICA AÑADIDA! ---
      // Guardamos el puntaje al finalizar la partida
      try {
        await Promise.all([
          this.ranking.addPoints(this.score()),
          this.results.save('preguntados', this.score(), { rounds: ROUNDS }),
        ]);
      } catch (e) {
        console.error('Error al guardar el puntaje:', e);
      }
      // --- FIN DE LA LÓGICA AÑADIDA ---

      return;
    }

    if (!first) {
      this.round.update((r) => r + 1);
    }
    this.loading.set(true);
    this.picked.set(undefined);
    this.error.set(null);

    try {
      this.q.set(await this.api.getQuestion());
    } catch (err) {
      console.error('Error al obtener la pregunta:', err);
      this.error.set('No se pudo cargar la pregunta. ¡Intenta de nuevo!');
    } finally {
      this.loading.set(false);
    }
  }

  pick(opt: string) {
    if (this.picked() || !this.q()) return;
    this.picked.set(opt);
    if (opt === this.q()!.correct) {
      this.score.update((s) => s + 1);
    }
  }

  reset() {
    this.loading.set(true);
    this.round.set(0);
    this.score.set(0);
    this.q.set(undefined);
    this.picked.set(undefined);
    this.finished.set(false);
    this.error.set(null);
    this.nextQuestion(true);
  }

  retry() {
    this.nextQuestion(this.round() === 0);
  }
}
