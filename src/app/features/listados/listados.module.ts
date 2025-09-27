import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListadosRoutingModule } from './listados-routing.module';
import { ListadosComponent } from './listados';

@NgModule({
  imports: [CommonModule, ListadosRoutingModule, ListadosComponent],
})
export class ListadosModule {}
