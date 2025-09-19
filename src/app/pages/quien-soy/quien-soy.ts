import { Component } from '@angular/core';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.scss'],
})
export class QuienSoyComponent {
  // Datos personales
  alumno = {
    nombre: 'Kevin Martin Plucci',
    dni: '42367060',
    curso: 'Laboratorio 4',
    mail: 'pluccikevin7@gmail.com',
  };

  // Explicación del juego propio
  juegoPropio = {
    titulo: 'Mi Juego Propio',
    descripcion: `Breve explicación del juego: objetivo, mecánicas principales,
    tecnologías usadas y cómo se gana/pierde.`,
  };
}
