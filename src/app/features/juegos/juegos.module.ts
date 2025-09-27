import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JuegosRoutingModule } from './juegos-routing.module';
import { JuegosHomeComponent } from './juegos-home';
import { AhorcadoComponent } from './ahorcado/ahorcado';
import { MayorMenorComponent } from './mayor-menor/mayor-menor';

@NgModule({
  imports: [
    CommonModule,
    JuegosRoutingModule,
    JuegosHomeComponent,
    AhorcadoComponent,
    MayorMenorComponent,
  ],
})
export class JuegosModule {}
