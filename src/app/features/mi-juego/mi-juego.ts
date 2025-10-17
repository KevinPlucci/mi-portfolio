import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingService } from '../../core/ranking.service';
import { ResultsService } from '../../core/results.service';

type Round = { series: number[]; correct: number; options: number[] };
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

  round = 0;
  score = 0;
  picked?: number;
  r?: Round;
  finished = false;

  ngOnInit(): void {
    this.r = this.makeRound();
  }

  makeRound(): Round {
    const a = this.rand(1, 20),
      d = this.rand(1, 9);
    const series = [a, a + d, a + 2 * d, a + 3 * d];
    const correct = a + 4 * d;
    const opts = new Set<number>([correct]);
    while (opts.size < 4) {
      const delta = this.rand(-5, 5) || 2;
      opts.add(correct + delta);
    }
    const options = this.shuffle([...opts]);
    return { series, correct, options };
  }

  pick(n: number) {
    if (!this.r || this.picked !== undefined) return;
    this.picked = n;
    if (n === this.r.correct) this.score++;
  }

  async next() {
    if (this.round >= ROUNDS - 1) {
      this.finished = true;
      await Promise.all([
        this.ranking.addPoints(this.score),
        this.results.save('secuencias', this.score, { rounds: ROUNDS }),
      ]);
      return;
    }
    this.round++;
    this.picked = undefined;
    this.r = this.makeRound();
  }

  reset() {
    this.round = 0;
    this.score = 0;
    this.picked = undefined;
    this.finished = false;
    this.r = this.makeRound();
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
