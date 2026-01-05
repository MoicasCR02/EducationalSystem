import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioIndex } from './usuario-index/usuario-index';
import { UsuarioDetail } from './usuario-detail/usuario-detail';
import { UsuarioAdmin } from './usuario-admin/usuario-admin';
import { UsuarioForm } from './usuario-form/usuario-form';
import { UsuarioLogin } from './usuario-login/usuario-login';
import { UsuarioCrear } from './usuario-crear/usuario-crear';
import { UsuarioFormcrear } from './usuario-formcrear/usuario-formcrear';
import { authGuard } from '../share/guards/auth.guard';
import { Dashboard } from '../dashboard-principal/dashboard/dashboard';


const routes: Routes = [
  { path: 'usuarios', component: UsuarioIndex , canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'usuario-admin',component: UsuarioAdmin, canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'usuario-crear',component: UsuarioCrear, canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'usuarios/create', component: UsuarioForm, canActivate: [authGuard], data:{roles:["ADMIN"]} },
  { path: 'usuarios/createnuevo', component: UsuarioFormcrear, canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'usuarios/updatenuevo/:id', component: UsuarioFormcrear, canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'usuarios/update/:id', component: UsuarioForm , canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'usuarios/:id', component: UsuarioDetail, canActivate: [authGuard], data:{roles:["ADMIN"]}},
  { path: 'login', component: UsuarioLogin},
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard], data:{roles:["ADMIN"]}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
