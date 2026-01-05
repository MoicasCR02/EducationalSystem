import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketsIndex } from './tickets-index/tickets-index';
import { TicketsDetail } from './tickets-detail/tickets-detail';
import { TicketsAdmin } from './tickets-admin/tickets-admin';
import { TicketsForm } from './tickets-form/tickets-form';
import { authGuard } from '../share/guards/auth.guard';

const routes: Routes = [
  { path: 'tickets', component: TicketsIndex },
  { path: 'tickets-admin',component: TicketsAdmin},
  { path: 'tickets/create', component: TicketsForm , canActivate: [authGuard], data:{roles:["USER"]}},
  { path: 'tickets/update/:id', component: TicketsForm },
  { path: 'tickets/:id', component: TicketsDetail},
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule { }
