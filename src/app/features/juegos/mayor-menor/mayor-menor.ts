import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Importamos RouterModule
import { RankingService } from '../../../core/ranking.service';
import { ResultsService } from '../../../core/results.service';
import { lastValueFrom } from 'rxjs';

// Tipos de la API
type ApiCard = {
  code: string;
  image: string;
  value: string;
  suit: string;
};

type DeckResponse = {
  success: boolean;
  deck_id: string;
  remaining: number;
};

type DrawResponse = {
  success: boolean;
  deck_id: string;
  cards: ApiCard[];
  remaining: number;
};

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule], // Añadimos RouterModule
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MayorMenorComponent implements OnInit {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);
  private http = inject(HttpClient);

  // Estado
  deckId = signal<string | null>(null);
  current = signal<ApiCard | null>(null);
  next = signal<ApiCard | null>(null);
  resultMessage = signal<string>('');

  score = signal(0);
  rounds = signal(0);
  finished = signal(false);
  loading = signal(true); // Indica carga general (mazo inicial o robo)
  isGuessing = signal(false); // Indica si está en medio de una adivinanza (para deshabilitar botones)

  // Controla si la próxima carta debe mostrarse volteada
  revealNext = signal(false);

  ngOnInit(): void {
    this.reset();
  }

  /** Reinicia el juego pidiendo un nuevo mazo a la API */
  async reset(): Promise<void> {
    this.loading.set(true);
    this.isGuessing.set(false);
    this.finished.set(false);
    this.score.set(0);
    this.rounds.set(0);
    this.current.set(null); // Limpiar carta actual también
    this.next.set(null);
    this.resultMessage.set('');
    this.revealNext.set(false);

    try {
      // 1) Nuevo mazo
      const deck = await lastValueFrom(
        this.http.get<DeckResponse>(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        )
      );
      this.deckId.set(deck.deck_id);

      // 2) Primera carta
      const draw = await lastValueFrom(
        this.http.get<DrawResponse>(
          `https://deckofcardsapi.com/api/deck/${this.deckId()}/draw/?count=1`
        )
      );
      if (draw.cards.length > 0) {
        this.current.set(draw.cards[0]);
      } else {
        throw new Error('No se pudo robar la carta inicial.'); // Manejar caso de mazo vacío inicial
      }
    } catch (error) {
      this.resultMessage.set(
        'Error al conectar con la API de cartas. Intenta de nuevo.'
      );
      console.error(error);
      this.finished.set(true); // Marcar como terminado si falla al inicio
    } finally {
      this.loading.set(false);
    }
  }

  /** Lógica principal del juego al adivinar */
  async guess(kind: 'mayor' | 'menor'): Promise<void> {
    // Previene clicks múltiples o mientras no hay carta actual o ya terminó
    if (this.isGuessing() || this.finished() || !this.current()) return;

    this.isGuessing.set(true); // Bloquea botones
    this.loading.set(true); // Muestra indicador de carga si es necesario (ej: pulso en dorso)
    this.resultMessage.set('');

    try {
      // Robar una carta
      const draw = await lastValueFrom(
        this.http.get<DrawResponse>(
          `https://deckofcardsapi.com/api/deck/${this.deckId()}/draw/?count=1`
        )
      );

      // Si no quedan cartas, termina el juego
      // Comprobación más robusta de fin de mazo
      if (
        draw.cards.length === 0 ||
        (draw.remaining !== null && draw.remaining < 0)
      ) {
        this.resultMessage.set('¡Se acabó el mazo!');
        this.endGame(true); // Indica que se acabó el mazo
        return;
      }

      const nextCard = draw.cards[0];
      this.next.set(nextCard); // Guardamos la siguiente carta
      this.revealNext.set(true); // ¡Marcamos para iniciar la animación de volteo!

      const currentValue = this.getCardNumericValue(this.current()!);
      const nextValue = this.getCardNumericValue(nextCard);
      const comparison = nextValue - currentValue;

      let correct = false;
      // Esperamos un poco para que la animación de volteo sea visible ANTES de mostrar el resultado
      await this.delay(500); // Espera 0.5s (ajusta según duración de la animación CSS)

      if (comparison === 0) {
        this.resultMessage.set(
          `¡Empate! Era otro ${this.formatCardValue(nextCard.value)}. Continúa.`
        );
        correct = true; // Empate cuenta como acierto para seguir jugando
      } else {
        correct =
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

      // Usamos setTimeout para la lógica DESPUÉS de mostrar el resultado
      setTimeout(async () => {
        if (!correct && comparison !== 0) {
          this.endGame(); // Termina si falló (y no fue empate)
        } else if (draw.remaining === 0) {
          // Si era la última carta
          this.endGame(true); // Termina indicando que se acabó el mazo
        } else {
          // Si acertó (o empató) y quedan cartas, preparamos la siguiente ronda
          this.current.set(this.next()!); // La 'next' pasa a ser 'current'
          this.next.set(null); // Limpiamos next para la siguiente adivinanza
          this.revealNext.set(false); // Ocultamos (reseteamos animación) la siguiente
          this.resultMessage.set(''); // Limpiamos mensaje para la siguiente ronda
          this.isGuessing.set(false); // Habilitamos botones de nuevo
          this.loading.set(false);
        }
      }, 1500); // Espera 1.5 segundos después de revelar y mostrar resultado
    } catch (error) {
      this.resultMessage.set('Error al robar una carta. Intenta de nuevo.');
      console.error(error);
      this.isGuessing.set(false); // Habilitamos botones si hay error
      this.loading.set(false);
    }
    // No ponemos finally loading(false) aquí porque el setTimeout lo controla
  }

  /** Fin de la partida: guarda resultado y ranking */
  private async endGame(outOfCards = false): Promise<void> {
    if (this.finished()) return; // Evita doble ejecución

    this.finished.set(true);
    this.isGuessing.set(false); // Asegura que los botones de adivinar estén deshabilitados
    this.loading.set(false); // Quita cualquier indicador de carga

    // Mejora el mensaje final si se quedó sin cartas
    if (outOfCards && this.resultMessage() === '¡Correcto!') {
      this.resultMessage.set('¡Correcto! ¡Te quedaste sin cartas!');
    } else if (outOfCards && this.resultMessage().startsWith('¡Empate!')) {
      this.resultMessage.update((msg) => msg + ' ¡Se acabó el mazo!');
    } else if (!this.resultMessage()) {
      // Si termina por error antes de un resultado
      this.resultMessage.set('Fin de la partida.');
    }

    // Guardamos resultados aunque haya habido error al final (si hubo score)
    try {
      await Promise.all([
        this.results.save('mayor-menor', this.score(), {
          rounds: this.rounds(),
        }),
        this.ranking.addPoints(this.score()),
      ]);
    } catch (saveError) {
      console.error('Error al guardar puntajes:', saveError);
      // Considera mostrar un mensaje al usuario
    }
  }

  /** Convierte el valor de la carta a número */
  private getCardNumericValue(card: ApiCard): number {
    const value = card.value.toUpperCase(); // Asegura mayúsculas
    const valueMap: { [key: string]: number } = {
      ACE: 1, // As bajo consistentemente
      JACK: 11,
      QUEEN: 12,
      KING: 13,
    };
    return valueMap[value] || Number(value); // Convierte números directamente
  }

  /** Formatea el valor de la carta para mostrar (ej: Rey en lugar de KING) */
  private formatCardValue(value: string): string {
    const valueMap: { [key: string]: string } = {
      ACE: 'As',
      JACK: 'Jota',
      QUEEN: 'Reina',
      KING: 'Rey',
    };
    return valueMap[value.toUpperCase()] || value;
  }

  /** Helper para crear delays con async/await */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
