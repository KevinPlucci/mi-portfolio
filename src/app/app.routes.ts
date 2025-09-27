import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { QuienSoyComponent } from './pages/quien-soy/quien-soy';
import { RegistroComponent } from './pages/registro/registro';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'quien-soy', component: QuienSoyComponent },
  {
    path: 'chat',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/chat/chat.module').then((m) => m.ChatModule),
  },
  {
    path: 'juegos',
    loadChildren: () =>
      import('./features/juegos/juegos.module').then((m) => m.JuegosModule),
  },
  {
    path: 'listados',
    loadChildren: () =>
      import('./features/listados/listados.module').then(
        (m) => m.ListadosModule
      ),
  },

  { path: '**', redirectTo: 'home' },
];
