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
  score = 0;
  finished = false;

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    // Generar mazo (4 palos x 13 valores)
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
    for (let s = 0; s < 4; s++) {
      values.forEach((v) => cards.push({ value: v, display: toDisp(v) }));
    }

    this.deck = this.shuffle(cards);
    this.score = 0;
    this.finished = false;
    this.current = this.deck.shift()!; // primera carta visible
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  guess(kind: 'mayor' | 'menor'): void {
    if (this.finished) return;

    const next = this.deck.shift();
    if (!next) {
      this.finished = true;
      return;
    }

    // Regla: acierta si la "siguiente" es >= (mayor) o <= (menor) a la actual.
    const ok =
      kind === 'mayor'
        ? next.value >= this.current.value
        : next.value <= this.current.value;

    if (ok) this.score++;

    // Revelamos la carta y pasa a ser la "actual"
    this.current = next;

    if (this.deck.length === 0) this.finished = true;
  }
}
