import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss'],
})
export class AhorcadoComponent {
  private palabras = [
    'ANGULAR',
    'FIREBASE',
    'PORTFOLIO',
    'COMPONENTE',
    'SERVICIO',
  ];
  letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  palabra = this.pick();
  elegidas = new Set<string>();
  errores = 0;
  maxErrores = 6;

  get mascara(): string {
    return this.palabra
      .split('')
      .map((l) => (this.elegidas.has(l) ? l : ' _ '))
      .join('');
  }
  get gano() {
    return this.palabra.split('').every((l) => this.elegidas.has(l));
  }
  get perdio() {
    return this.errores >= this.maxErrores;
  }

  pick() {
    return this.palabras[Math.floor(Math.random() * this.palabras.length)];
  }
  elegir(l: string) {
    if (this.gano || this.perdio || this.elegidas.has(l)) return;
    this.elegidas.add(l);
    if (!this.palabra.includes(l)) this.errores++;
  }
  reiniciar() {
    this.palabra = this.pick();
    this.elegidas.clear();
    this.errores = 0;
  }
}
