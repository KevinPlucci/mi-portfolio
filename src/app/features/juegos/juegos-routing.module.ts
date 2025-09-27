import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JuegosHomeComponent } from './juegos-home';
import { AhorcadoComponent } from './ahorcado/ahorcado';
import { MayorMenorComponent } from './mayor-menor/mayor-menor';

const routes: Routes = [
  { path: '', component: JuegosHomeComponent },
  { path: 'ahorcado', component: AhorcadoComponent },
  { path: 'mayor-menor', component: MayorMenorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuegosRoutingModule {}
