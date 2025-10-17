import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuienSoyComponent {
  nombre = 'Kevin Plucci';
  rol = 'Analista / Desarrollador';
  descripcion = `
    Portfolio hecho con Angular standalone y Firebase. Incluye un chat en tiempo real y varios juegos:
    Ahorcado, Mayor o Menor, Preguntados (banderas) y un juego propio de Secuencias numéricas.
  `;
  imagenUrl = 'assets/img/alumno.jpg';
  skills = ['Angular', 'TypeScript', 'Firebase', 'SCSS', 'Flutter', 'DFD/DER'];
  juegos = [
    {
      titulo: 'Ahorcado',
      texto:
        'Adiviná la palabra antes de completar el cuerpo. +1 por victoria.',
    },
    {
      titulo: 'Mayor o Menor',
      texto: 'Pronosticá la siguiente carta. Sumás por acierto.',
    },
    {
      titulo: 'Preguntados',
      texto:
        'Identificá el país según su bandera. Opciones múltiples, imágenes desde API.',
    },
    {
      titulo: 'Secuencias',
      texto:
        'Dada una serie aritmética, elegí el siguiente número correcto entre 4 opciones.',
    },
  ];
  links = [
    { label: 'GitHub', url: 'https://github.com/KevinPlucci' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kevinplucci/' },
  ];
}
