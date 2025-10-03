import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListadosComponent } from './listados';

const routes: Routes = [
  { path: '', component: ListadosComponent, title: 'Listados' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListadosRoutingModule {}
