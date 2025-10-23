import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntadosService, Question } from './preguntados.service';
import { RankingService } from '../../core/ranking.service';
import { ResultsService } from '../../core/results.service';
// --- CAMBIO: Importamos RouterLink para el botón de volver ---
import { RouterLink } from '@angular/router';

const ROUNDS = 10;

@Component({
  selector: 'app-preguntados',
  standalone: true,
  // --- CAMBIO: Añadimos RouterLink a los imports ---
  imports: [CommonModule, RouterLink],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntadosComponent {
  private api = inject(PreguntadosService);
  private ranking = inject(RankingService);
  private results = inject(ResultsService);

  loading = signal(true);
  round = signal(0);
  score = signal(0);
  q = signal<Question | undefined>(undefined);
  picked = signal<string | undefined>(undefined);
  finished = signal(false);
  error = signal<string | null>(null);

  // --- CAMBIO: Array para guardar los códigos de países ya usados en la partida ---
  private usedCountryCodes: string[] = [];

  constructor() {
    this.nextQuestion(true);
  }

  async nextQuestion(first = false) {
    if (!first && this.round() >= ROUNDS - 1) {
      this.finished.set(true);
      try {
        await Promise.all([
          this.ranking.addPoints(this.score()),
          this.results.save('preguntados', this.score(), { rounds: ROUNDS }),
        ]);
      } catch (e) {
        console.error('Error al guardar el puntaje:', e);
      }
      return;
    }

    if (!first) {
      this.round.update((r) => r + 1);
    }
    this.loading.set(true);
    this.picked.set(undefined);
    this.error.set(null);

    try {
      // --- CAMBIO: Pasamos la lista de códigos usados al servicio ---
      const question = await this.api.getQuestion(this.usedCountryCodes);
      this.q.set(question);
      // --- CAMBIO: Añadimos el nuevo código a nuestra lista de usados ---
      this.usedCountryCodes.push(question.countryCode);
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
    // --- CAMBIO: Limpiamos la lista de países usados al reiniciar ---
    this.usedCountryCodes = [];
    this.nextQuestion(true);
  }

  retry() {
    this.nextQuestion(this.round() === 0);
  }
}
