import { Component, effect, Inject, inject, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioRoutingModule } from '../usuario-routing-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { from } from 'rxjs';
import { UsuarioService } from '../../share/services/api/usuario.service';

@Component({
  selector: 'app-usuario-diag',
  standalone: false,
  templateUrl: './usuario-diag.html',
  styleUrl: './usuario-diag.css',
})
export class UsuarioDiag {
    // Signal para almacenar el videojuego obtenido del API
  datos = signal<UsuarioModel | null>(null);

  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number };

  // Inyectar servicios
  private vjService = inject(UsuarioService);
  private dialogRef = inject(MatDialogRef<UsuarioDiag>);

  constructor(@Inject(MAT_DIALOG_DATA) data: { id: number }) {
    this.datosDialog = data;

    // Si hay ID, cargar los datos del videojuego
    if (this.datosDialog?.id) {
      this.obtenerTecnico(this.datosDialog.id);
    }
  }

  // Cargar videojuego usando Signals y effect
  private obtenerTecnico(id: number) {
    const usuario$ = from(this.vjService.getById(id));

    effect(() => {
      usuario$.subscribe({
        next: (data: UsuarioModel) => {
          console.log('📥 Datos recibidos del servicio:', data); 
          this.datos.set(data);
          console.log('📦 Signal datos actualizado:', this.datos()); 
        },
        error: (err) => console.error('❌ Error cargando categorias:', err),
      });
    });
  }

  // Cerrar diálogo
  close() {
    this.dialogRef.close();
  }
}
