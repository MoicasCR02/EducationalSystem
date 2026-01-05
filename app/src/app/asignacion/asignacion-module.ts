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
import { AsignacionRoutingModule } from './asignacion-routing-module';
import { AsignacionIndex } from './asignacion-index/asignacion-index';
import { AsignacionDetail } from './asignacion-detail/asignacion-detail';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDateRangeInput, MatDateRangePicker } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { AsignacionAdmin } from './asignacion-admin/asignacion-admin';
import { MatListModule } from '@angular/material/list';



@NgModule({
  declarations: [
    AsignacionIndex,
    AsignacionDetail,
    AsignacionAdmin
  ],
  imports: [
    CommonModule,
    AsignacionRoutingModule,
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
    MatDatepicker,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatDateRangeInput,
    MatDateRangePicker,
    TranslateModule,
    MatListModule
  ]
})
export class AsignacionModule { }
