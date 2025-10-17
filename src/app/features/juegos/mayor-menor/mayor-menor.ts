import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingService } from '../../../core/ranking.service';
import { ResultsService } from '../../../core/results.service';

type Suit = '♠' | '♥' | '♦' | '♣';
type Card = { value: number; suit: Suit };

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MayorMenorComponent implements OnInit {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);

  deck: Card[] = [];
  current?: Card;
  next?: Card;

  score = 0;
  rounds = 0;
  finished = false;

  /** Alias para compatibilidad con la plantilla antigua */
  get guesses(): number {
    return this.rounds;
  }

  ngOnInit(): void {
    this.reset();
  }

  /** Reinicia el mazo y el estado */
  reset(): void {
    this.deck = this.createShuffledDeck();
    this.score = 0;
    this.rounds = 0;
    this.finished = false;
    this.current = this.deck.pop();
    this.next = undefined;
  }

  /** Acceso compatible: la plantilla puede llamar guess('mayor'|'menor') */
  guess(kind: 'mayor' | 'menor'): void {
    this.play(kind);
  }

  /** Lógica del juego */
  private play(kind: 'mayor' | 'menor'): void {
    if (this.finished || !this.current) return;

    this.next = this.deck.pop();
    if (!this.next) {
      this.endGame();
      return;
    }

    const cmp = this.compare(this.next.value, this.current.value);
    const ok = (kind === 'mayor' && cmp > 0) || (kind === 'menor' && cmp < 0);
    if (ok) this.score++;
    this.rounds++;

    // Avanza
    this.current = this.next;
    this.next = undefined;

    if (this.deck.length === 0) this.endGame();
  }

  /** Fin de la partida: guarda resultado y ranking */
  private async endGame(): Promise<void> {
    this.finished = true;
    await Promise.all([
      this.results.save('mayor-menor', this.score, { rounds: this.rounds }),
      this.ranking.addPoints(this.score),
    ]);
  }

  /** Helpers */
  label(c?: Card): string {
    if (!c) return '';
    const map: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    const v = map[c.value] ?? String(c.value);
    return `${v}${c.suit}`;
  }

  private compare(a: number, b: number): number {
    return a === b ? 0 : a > b ? 1 : -1;
  }

  private createShuffledDeck(): Card[] {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const deck: Card[] = [];
    for (const s of suits)
      for (let v = 1; v <= 13; v++) deck.push({ value: v, suit: s });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}
