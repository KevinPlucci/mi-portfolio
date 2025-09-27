import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.scss'],
})
export class QuienSoyComponent {
  alumno = {
    nombre: 'KKevin Martin Plucci',
    legajo: '110646',
    curso: 'Laboratorio 4',
    email: 'pluccikevin7@ejemplo.com',
    juego: {
      titulo: 'Mi juego propio',
      descripcion:
        'Breve explicación del juego: tecnología usada, objetivo, qué lo hace único, y enlace demo si existe.',
    },
    imagenUrl: 'assets/images/alumno.jpg', // Colocá tu foto en esta ruta
  };
}
