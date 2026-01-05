import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriaIndex } from './categoria-index/categoria-index';
import { CategoriaDetail } from './categoria-detail/categoria-detail';
import { CategoriaAdmin } from './categoria-admin/categoria-admin';
import { CategoriaForm } from './categoria-form/categoria-form';

const routes: Routes = [
  { path: 'categorias', component: CategoriaIndex },
  { path: 'categoria-admin',component: CategoriaAdmin},
  { path: 'categorias/create', component: CategoriaForm },
  { path: 'categorias/update/:id', component: CategoriaForm },
  { path: 'categorias/:id', component: CategoriaDetail},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriaRoutingModule { }
