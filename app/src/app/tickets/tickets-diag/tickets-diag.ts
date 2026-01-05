import { Component, effect, Inject, inject, signal } from '@angular/core';
import { TicketsModel } from '../../share/models/TicketsModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { from } from 'rxjs';

@Component({
  selector: 'app-tickets-diag',
  standalone: false,
  templateUrl: './tickets-diag.html',
  styleUrl: './tickets-diag.css',
})
export class TicketsDiag {
     // Signal para almacenar el videojuego obtenido del API
  datos = signal<TicketsModel | null>(null);

  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number };

  // Inyectar servicios
  private vjService = inject(TicketsService);
  private dialogRef = inject(MatDialogRef<TicketsDiag>);

  constructor(@Inject(MAT_DIALOG_DATA) data: { id: number }) {
    this.datosDialog = data;

    // Si hay ID, cargar los datos del videojuego
    if (this.datosDialog?.id) {
      this.obtenerTicket(this.datosDialog.id);
    }
  }

  // Cargar videojuego usando Signals y effect
  private obtenerTicket(id: number) {
    const ticket$ = from(this.vjService.getById(id));

    effect(() => {
      ticket$.subscribe({
        next: (data: TicketsModel) => {
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
