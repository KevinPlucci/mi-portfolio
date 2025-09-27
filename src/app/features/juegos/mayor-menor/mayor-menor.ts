import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type Card = { value: number; display: string };

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss'],
})
export class MayorMenorComponent implements OnInit {
  deck: Card[] = [];
  current!: Card;
  next?: Card;
  score = 0;
  finished = false;

  ngOnInit() {
    this.reset();
  }

  reset() {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const toDisp = (v: number) =>
      v === 1
        ? 'A'
        : v === 11
        ? 'J'
        : v === 12
        ? 'Q'
        : v === 13
        ? 'K'
        : String(v);
    const cards: Card[] = [];
    for (let s = 0; s < 4; s++)
      values.forEach((v) => cards.push({ value: v, display: toDisp(v) }));
    this.deck = this.shuffle(cards);
    this.score = 0;
    this.finished = false;
    this.current = this.deck.shift()!;
    this.next = undefined;
  }

  shuffle<T>(a: T[]) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  guess(kind: 'mayor' | 'menor') {
    if (this.finished) return;
    const card = this.deck.shift();
    if (!card) {
      this.finished = true;
      return;
    }

    this.next = card;
    const ok =
      kind === 'mayor'
        ? card.value >= this.current.value
        : card.value <= this.current.value;
    if (ok) this.score++;
    this.current = card;

    if (this.deck.length === 0) this.finished = true;
  }
}
