import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importamos Router y RouterModule
import { RankingService } from '../../../core/ranking.service';
import { ResultsService } from '../../../core/results.service';

// Definimos los posibles estados del juego
type GameState = 'playing' | 'won' | 'lost' | 'askNewGame' | 'maxStreak';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadimos RouterModule aquí
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AhorcadoComponent {
  private ranking = inject(RankingService);
  private results = inject(ResultsService);
  private router = inject(Router); // Inyectamos Router

  // Lista de palabras (puedes añadir más)
  private palabras = [
    'ANGULAR',
    'FIREBASE',
    'COMPONENTE',
    'SERVICIO',
    'ESCALABILIDAD',
    'TEMPLATES',
    'ENRUTADOR',
    'OPTIMIZACION',
    'PORTAFOLIO',
    'SUSCRIPCION',
    'TYPESCRIPT',
    'JAVASCRIPT',
    'HTML',
    'CSS',
    'FRAMEWORK',
  ];

  // --- Estado del Juego como Signals ---
  palabra = signal('');
  elegidas = signal<Set<string>>(new Set());
  errores = signal(0);
  maxErrores = 6;
  streakScore = signal(0); // Puntuación de la racha actual
  gameState = signal<GameState>('playing'); // Estado actual del juego
  readonly MAX_STREAK = 5; // Máximo de victorias seguidas

  constructor() {
    this.nuevaPartida(); // Inicia el juego al crear el componente
  }

  /** Inicia una nueva palabra/ronda */
  nuevaPartida(): void {
    this.palabra.set(this.randomWord());
    this.elegidas.set(new Set()); // Limpia las letras elegidas
    this.errores.set(0);
    this.gameState.set('playing'); // Vuelve al estado de juego
    // No reseteamos streakScore aquí, se maneja en las acciones
  }

  /** Procesa la elección de una letra por el usuario */
  elegir(letra: string): void {
    // No hacer nada si no estamos jugando o la letra ya fue elegida
    if (this.gameState() !== 'playing' || this.elegidas().has(letra)) return;

    // Actualiza el set de letras elegidas (usando signal.update)
    this.elegidas.update((currentSet) => new Set(currentSet).add(letra));

    if (!this.palabra().includes(letra)) {
      // --- Error ---
      this.errores.update((e) => e + 1);
      if (this.errores() >= this.maxErrores) {
        // --- Perdió ---
        this.handleLoss();
      }
    } else if (this.completa()) {
      // --- Ganó ---
      this.handleWin();
    }
  }

  /** Calcula la máscara de la palabra (letras adivinadas y guiones) */
  get mascara(): string {
    const palabraActual = this.palabra();
    const elegidasActual = this.elegidas();
    if (!palabraActual) return ''; // Asegura que haya una palabra
    return palabraActual
      .split('')
      .map((c) => (elegidasActual.has(c) ? c : '_'))
      .join(' '); // Añade espacio para mejor legibilidad
  }

  /** Devuelve el array de letras para el teclado */
  get abecedario(): string[] {
    return 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  }

  // --- Lógica de Fin de Partida y Acciones ---

  private async handleLoss(): Promise<void> {
    // Guardar resultado (0 puntos) y ranking (0 puntos añadidos)
    await this.saveGameResult(0); // Guardamos la derrota con 0 puntos
    await this.ranking.addPoints(0); // No suma puntos al ranking general
    this.streakScore.set(0); // Resetea la racha
    this.gameState.set('lost'); // Cambia el estado a 'perdido'
  }

  private async handleWin(): Promise<void> {
    await this.saveGameResult(1); // Guarda la victoria con 1 punto
    this.streakScore.update((s) => s + 1); // Incrementa la racha

    if (this.streakScore() >= this.MAX_STREAK) {
      // --- Racha Máxima ---
      await this.ranking.addPoints(this.streakScore()); // Guarda la puntuación total de la racha
      this.gameState.set('maxStreak'); // Cambia el estado a 'racha máxima'
    } else {
      // --- Ganó Ronda (puede continuar) ---
      this.gameState.set('won'); // Cambia el estado a 'ganó ronda'
    }
  }

  /** Guarda el resultado de una partida individual (victoria o derrota) */
  private async saveGameResult(puntos: number): Promise<void> {
    try {
      await this.results.save('ahorcado', puntos, {
        palabra: this.palabra(),
        errores: this.errores(),
      });
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      // Podrías mostrar un mensaje al usuario aquí
    }
  }

  /** Acción: El usuario elige continuar la racha */
  continueStreak(): void {
    if (this.gameState() === 'won') {
      this.nuevaPartida(); // Simplemente empieza otra palabra
    }
  }

  /** Acción: El usuario elige NO continuar la racha */
  async endStreakAndAskNewGame(): Promise<void> {
    if (this.gameState() === 'won') {
      // Guardar la puntuación de la racha actual ANTES de preguntar
      await this.ranking.addPoints(this.streakScore());
      this.gameState.set('askNewGame'); // Pregunta si quiere empezar de cero
    }
  }

  /** Acción: El usuario elige empezar una nueva partida (racha 0) */
  startNewGame(): void {
    if (
      this.gameState() === 'lost' ||
      this.gameState() === 'askNewGame' ||
      this.gameState() === 'playing' // <-- CORRECCIÓN APLICADA AQUÍ
    ) {
      this.streakScore.set(0); // Asegura que la racha se reinicie
      this.nuevaPartida();
    }
  }

  /** Acción: El usuario elige ir al Home */
  goToHome(): void {
    // Si estaba en una racha y elige irse, guarda la puntuación
    if (this.gameState() === 'askNewGame') {
      // El puntaje ya se guardó en endStreakAndAskNewGame
    } else if (this.gameState() === 'maxStreak') {
      // El puntaje ya se guardó al alcanzar la racha
    }
    // Si pierde y elige irse, el puntaje (0) ya se guardó

    this.streakScore.set(0); // Reinicia la racha por si acaso
    this.router.navigate(['/home']); // Navega al Home
  }

  // --- Helpers ---

  /** Verifica si la palabra actual está completa */
  private completa(): boolean {
    const palabraActual = this.palabra();
    const elegidasActual = this.elegidas();
    if (!palabraActual) return false;
    for (const c of palabraActual) {
      if (!elegidasActual.has(c)) return false;
    }
    return true;
  }

  /** Elige una palabra aleatoria de la lista */
  private randomWord(): string {
    const i = Math.floor(Math.random() * this.palabras.length);
    return this.palabras[i];
  }
}
