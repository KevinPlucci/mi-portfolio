import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RankingService } from '../../../core/ranking.service';
import { ResultsService } from '../../../core/results.service';
import { lastValueFrom } from 'rxjs';

// El tipo de dato que nos devuelve la API para una carta
type ApiCard = {
  code: string; // "8H", "KS", etc.
  image: string; // URL de la imagen de la carta
  value: string; // "8", "KING", "ACE"
  suit: string; // "HEARTS", "SPADES"
};

// Respuesta de la API al crear un mazo
type DeckResponse = {
  success: boolean;
  deck_id: string;
  remaining: number;
};

// Respuesta de la API al robar una carta
type DrawResponse = {
  success: boolean;
  deck_id: string;
  cards: ApiCard[];
  remaining: number;
};

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // HttpClientModule es necesario
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MayorMenorComponent implements OnInit {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);
  private http = inject(HttpClient); // Inyectamos HttpClient

  // --- Estado del Juego con Signals ---
  deckId = signal<string | null>(null);
  current = signal<ApiCard | null>(null);
  next = signal<ApiCard | null>(null);
  resultMessage = signal<string>('');

  score = signal(0);
  rounds = signal(0);
  finished = signal(false);
  loading = signal(true); // Para mostrar un estado de carga inicial

  ngOnInit(): void {
    this.reset();
  }

  /** Reinicia el juego pidiendo un nuevo mazo a la API */
  async reset(): Promise<void> {
    this.loading.set(true);
    this.finished.set(false);
    this.score.set(0);
    this.rounds.set(0);
    this.next.set(null);
    this.resultMessage.set('');

    try {
      // 1. Pedimos un nuevo mazo barajado
      const deck = await lastValueFrom(
        this.http.get<DeckResponse>(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        )
      );
      this.deckId.set(deck.deck_id);

      // 2. Robamos la primera carta para empezar
      const draw = await lastValueFrom(
        this.http.get<DrawResponse>(
          `https://deckofcardsapi.com/api/deck/${this.deckId()}/draw/?count=1`
        )
      );
      this.current.set(draw.cards[0]);
    } catch (error) {
      this.resultMessage.set(
        'Error al conectar con la API de cartas. Intenta de nuevo.'
      );
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  /** Lógica principal del juego al adivinar */
  async guess(kind: 'mayor' | 'menor'): Promise<void> {
    if (this.loading() || this.finished() || !this.current()) return;

    // Si ya existe una "siguiente carta" (de la ronda anterior),
    // la movemos para que sea la "carta actual" de esta nueva ronda.
    if (this.next()) {
      this.current.set(this.next()!);
    }

    this.loading.set(true);
    this.resultMessage.set('');
    this.next.set(null); // Limpiamos la vista para mostrar que estamos robando

    try {
      // 1. Robamos la siguiente carta
      const draw = await lastValueFrom(
        this.http.get<DrawResponse>(
          `https://deckofcardsapi.com/api/deck/${this.deckId()}/draw/?count=1`
        )
      );

      if (draw.cards.length === 0 || draw.remaining === 0) {
        this.endGame();
        return;
      }

      const nextCard = draw.cards[0];
      this.next.set(nextCard);

      const currentValue = this.getCardNumericValue(this.current()!);
      const nextValue = this.getCardNumericValue(nextCard);

      const comparison = nextValue - currentValue;

      if (comparison === 0) {
        this.resultMessage.set(
          `¡Empate! La carta era otro ${nextCard.value}. No sumas puntos.`
        );
      } else {
        const correct =
          (kind === 'mayor' && comparison > 0) ||
          (kind === 'menor' && comparison < 0);
        if (correct) {
          this.score.update((s) => s + 1);
          this.resultMessage.set('¡Correcto!');
        } else {
          this.resultMessage.set('¡Incorrecto!');
        }
      }

      this.rounds.update((r) => r + 1);

      if (draw.remaining === 0) {
        this.endGame();
      }
    } catch (error) {
      this.resultMessage.set('Error al robar una carta. Intenta de nuevo.');
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  /** Fin de la partida: guarda resultado y ranking */
  private async endGame(): Promise<void> {
    this.finished.set(true);
    await Promise.all([
      this.results.save('mayor-menor', this.score(), { rounds: this.rounds() }),
      this.ranking.addPoints(this.score()),
    ]);
  }

  /** Helper para convertir el valor de la carta (ej: "KING") a un número */
  private getCardNumericValue(card: ApiCard): number {
    const valueMap: { [key: string]: number } = {
      ACE: 1,
      JACK: 11,
      QUEEN: 12,
      KING: 13,
    };
    return valueMap[card.value] || Number(card.value);
  }
}
