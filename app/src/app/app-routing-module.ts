import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Inicio } from './home/inicio/inicio';
import { PageNotFound } from './share/page-not-found/page-not-found';
import { UsuarioLogin } from './usuario/usuario-login/usuario-login';
import { Dashboard } from './dashboard-principal/dashboard/dashboard';

const routes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', component: PageNotFound },
  { path: 'dashboard', component: Dashboard },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
