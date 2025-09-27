import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-juegos-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './juegos-home.html',
  styleUrls: ['./juegos-home.scss'],
})
export class JuegosHomeComponent {}
