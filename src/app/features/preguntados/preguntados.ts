import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntadosService, Question } from './preguntados.service';
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
  private ranking = inject(RankingService);
  private results = inject(ResultsService);

  loading = true;
  round = 0;
  score = 0;
  q?: Question;
  picked?: string;
  finished = false;

  async ngOnInit() {
    await this.nextQuestion(true);
  }

  async nextQuestion(first = false) {
    if (!first && this.round >= ROUNDS - 1) {
      this.finished = true;
      await Promise.all([
        this.ranking.addPoints(this.score),
        this.results.save('preguntados', this.score, { rounds: ROUNDS }),
      ]);
      return;
    }
    if (!first) this.round++;
    this.loading = true;
    this.picked = undefined;
    try {
      this.q = await this.api.getQuestion();
    } finally {
      this.loading = false;
    }
  }

  pick(opt: string) {
    if (this.picked || !this.q) return;
    this.picked = opt;
    if (opt === this.q.correct) this.score++;
  }

  reset() {
    this.loading = true;
    this.round = 0;
    this.score = 0;
    this.q = undefined;
    this.picked = undefined;
    this.finished = false;
    this.nextQuestion(true);
  }
}
