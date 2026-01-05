import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioRoutingModule } from './usuario-routing-module';
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
import { UsuarioIndex } from './usuario-index/usuario-index';
import { UsuarioDetail } from './usuario-detail/usuario-detail';
import { UsuarioForm } from './usuario-form/usuario-form';
import { UsuarioAdmin } from './usuario-admin/usuario-admin';
import { UsuarioDiag } from './usuario-diag/usuario-diag';
import { TranslateModule } from '@ngx-translate/core';
import { UsuarioLogin } from './usuario-login/usuario-login';
import { UsuarioCrear } from './usuario-crear/usuario-crear';
import { UsuarioFormcrear } from './usuario-formcrear/usuario-formcrear';
@NgModule({
  declarations: [
    UsuarioIndex,
    UsuarioDetail,
    UsuarioForm,
    UsuarioAdmin,
    UsuarioDiag,
    UsuarioLogin,
    UsuarioCrear,
    UsuarioFormcrear,
  ],
  imports: [
    CommonModule,
    UsuarioRoutingModule,
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
    TranslateModule
  ]
})
export class UsuarioModule { }
