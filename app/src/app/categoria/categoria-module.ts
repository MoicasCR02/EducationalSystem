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
import { CategoriaRoutingModule } from './categoria-routing-module';
import { CategoriaIndex } from './categoria-index/categoria-index';
import { CategoriaDetail } from './categoria-detail/categoria-detail';
import { FormsModule } from '@angular/forms';
import { CategoriaAdmin } from './categoria-admin/categoria-admin';
import { CategoriaDiag } from './categoria-diag/categoria-diag';
import { CategoriaForm } from './categoria-form/categoria-form';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    CategoriaIndex,
    CategoriaDetail,
    CategoriaAdmin,
    CategoriaDiag,
    CategoriaForm,
  ],
  imports: [
    CommonModule,
    CategoriaRoutingModule,
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
    TranslateModule
  ]
})
export class CategoriaModule { }
