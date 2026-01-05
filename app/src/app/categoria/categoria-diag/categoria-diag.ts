import { Component, effect, Inject, inject, signal } from '@angular/core';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { from } from 'rxjs';

@Component({
  selector: 'app-categoria-diag',
  standalone: false,
  templateUrl: './categoria-diag.html',
  styleUrl: './categoria-diag.css',
})
export class CategoriaDiag {
  // Signal para almacenar el videojuego obtenido del API
  datos = signal<CategoriaModel | null>(null);

  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number };

  // Inyectar servicios
  private vjService = inject(CategoriaService);
  private dialogRef = inject(MatDialogRef<CategoriaDiag>);

  constructor(@Inject(MAT_DIALOG_DATA) data: { id: number }) {
    this.datosDialog = data;

    // Si hay ID, cargar los datos del videojuego
    if (this.datosDialog?.id) {
      this.obtenerCategoria(this.datosDialog.id);
    }
  }

  // Cargar videojuego usando Signals y effect
  private obtenerCategoria(id: number) {
    const categoria$ = from(this.vjService.getById(id));

    effect(() => {
      categoria$.subscribe({
        next: (data: CategoriaModel) => {
          console.log('📥 Datos recibidos del servicio:', data); // 👈 aquí ves la respuesta
          this.datos.set(data);
          console.log('📦 Signal datos actualizado:', this.datos()); // 👈 aquí ves el valor en el signal
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
