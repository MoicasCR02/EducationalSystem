import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionIndex } from './asignacion-index/asignacion-index';
import { AsignacionDetail } from './asignacion-detail/asignacion-detail';
import { AsignacionAdmin } from './asignacion-admin/asignacion-admin';
import { authGuard } from '../share/guards/auth.guard';

const routes: Routes = [
  { path: 'asignaciones', component: AsignacionIndex , canActivate: [authGuard], data:{roles:["TECNICO","ADMIN"]}},
  { path: 'asignaciones/:id', component: AsignacionDetail, canActivate: [authGuard], data:{roles:["TECNICO","ADMIN"]}},
  { path: 'asignaciones-admin', component: AsignacionAdmin, canActivate: [authGuard], data:{roles:["ADMIN"]}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionRoutingModule { }
