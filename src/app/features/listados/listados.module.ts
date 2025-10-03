import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ListadosRoutingModule } from './listados-routing.module';
import { ListadosComponent } from './listados'; // 👈 standalone

@NgModule({
  // Un componente standalone NO va en declarations; va en imports.
  imports: [
    CommonModule,
    RouterModule,
    ListadosRoutingModule,
    ListadosComponent, // 👈 importa el standalone para usarlo en las rutas del módulo
  ],
  // Si querés re-exportarlo para que otros módulos lo usen, podés exportarlo:
  exports: [ListadosComponent],
})
export class ListadosModule {}
