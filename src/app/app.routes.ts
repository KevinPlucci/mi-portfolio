// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  // Públicas
  {
    path: 'home',
    title: 'Inicio',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    title: 'Ingresar',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    title: 'Registro',
    loadComponent: () =>
      import('./pages/registro/registro').then((m) => m.RegistroComponent),
  },
  {
    path: 'quien-soy',
    title: 'Quién Soy',
    loadComponent: () =>
      import('./pages/quien-soy/quien-soy').then((m) => m.QuienSoyComponent),
  },

  // Protegidas (requieren sesión)
  {
    path: 'chat',
    title: 'Chat',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/chat/chat').then((m) => m.ChatComponent),
  },
  {
    path: 'juegos',
    title: 'Juegos',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/juegos/juegos.module').then((m) => m.JuegosModule),
  },
  {
    path: 'preguntados',
    title: 'Preguntados',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/preguntados/preguntados').then(
        (m) => m.PreguntadosComponent
      ),
  },
  {
    path: 'mi-juego',
    title: 'Secuencias',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/mi-juego/mi-juego').then((m) => m.MiJuegoComponent),
  },
  {
    path: 'listados',
    title: 'Listados',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/listados/listados').then((m) => m.ListadosComponent),
  },
  {
    path: 'encuesta',
    title: 'Encuesta',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./pages/encuesta/encuesta').then((m) => m.EncuestaComponent),
  },

  // Solo administradores (CanActivate)
  {
    path: 'encuesta-respuestas',
    title: 'Respuestas de la encuesta',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/encuesta-respuestas/encuesta-respuestas').then(
        (m) => m.EncuestaRespuestasComponent
      ),
  },

  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' },
];
