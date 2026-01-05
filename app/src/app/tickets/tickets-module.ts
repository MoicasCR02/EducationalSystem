import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TicketsRoutingModule } from './tickets-routing-module';
import { TicketsIndex } from './tickets-index/tickets-index';
import { TicketsDetail } from './tickets-detail/tickets-detail';
import { TicketsAdmin } from './tickets-admin/tickets-admin';
import { TicketsDiag } from './tickets-diag/tickets-diag';
import { TicketsForm } from './tickets-form/tickets-form';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core'; 
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { TicketsAsignacion } from './tickets-asignacion/tickets-asignacion';
import { TicketsProceso } from './tickets-proceso/tickets-proceso';
import { TicketsResuelto } from './tickets-resuelto/tickets-resuelto';
import { TicketsCerrado } from './tickets-cerrado/tickets-cerrado';
@NgModule({
  declarations: [
    TicketsIndex,
    TicketsDetail,
    TicketsAdmin,
    TicketsDiag,
    TicketsForm,
    TicketsAsignacion,
    TicketsProceso,
    TicketsResuelto,
    TicketsCerrado
  ],
  imports: [
    CommonModule,
    TicketsRoutingModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    MatDialogModule,
    MatRadioModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    FormsModule,
    BrowserModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatListModule,
    TranslateModule,
  ]
})
export class TicketsModule { }
