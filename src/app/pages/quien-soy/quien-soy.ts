import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Juego = {
  titulo: string;
  descripcion: string;
};

type Alumno = {
  nombre: string;
  legajo: string;
  curso: string;
  email: string;
  imagenUrl: string; // 👈 usaremos /assets/...
  juego: Juego;
};

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.scss'],
})
export class QuienSoyComponent {
  // Ajustá los datos a gusto. Lo clave es imagenUrl ↓
  alumno: Alumno = {
    nombre: 'Kevin Martín Plucci',
    legajo: '110646',
    curso: 'Laboratorio 4',
    email: 'pluccikevin7@ejemplo.com',
    imagenUrl: 'assets/img/alumno.jpg',
    juego: {
      titulo: 'Mi juego propio',
      descripcion:
        'Breve explicación del juego: tecnología usada, objetivo, qué lo hace único, etc.',
    },
  };
}
