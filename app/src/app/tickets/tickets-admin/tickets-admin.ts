import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TicketsModel } from '../../share/models/TicketsModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { TicketsDiag } from '../tickets-diag/tickets-diag';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-tickets-admin',
  standalone: false,
  templateUrl: './tickets-admin.html',
  styleUrl: './tickets-admin.css',
})
export class TicketsAdmin {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //Cambio TicketsModel
  dataSource = new MatTableDataSource<TicketsModel>();
  // Signals
  tickets = signal<TicketsModel[]>([]);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['titulo', 'descripcion', 'fecha_creacion', 'acciones'];

  readonly dialog = inject(MatDialog);
  private authService = inject(AuthenticationService);
  /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  readonly idUsuario = computed(() => this.currentUser()?.id_usuario ?? 0);

  constructor(
    private vjService: TicketsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.listTickets();
  }

  ngOnInit() {
    //Label paginator
    this.paginator._intl.itemsPerPageLabel = 'Items';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.firstPageLabel = 'Inicio';
    this.paginator._intl.lastPageLabel = 'Fin';
  }

  //Listar todos los videojuegos del API
  listTickets() {
    const user = this.currentUser(); // ejecuta el signal
    const idUsuario = user?.id_usuario;

    if (!idUsuario) {
      console.warn('⚠️ No hay usuario logueado todavía');
      return;
    }
    //localhost:3000/videojuego
    this.vjService.getByUser(idUsuario).subscribe((respuesta: TicketsModel[]) => {
      console.log(respuesta);
      //Cambio
      this.tickets.set(respuesta);
      this.dataSource.data = this.tickets();
      // Actualiza la signal
      this.tickets.set(respuesta);

      // Actualiza dataSource.data
      this.dataSource.data = this.tickets();

      // Re-asignar paginator y sort después de cambiar los datos
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  detalleTicket(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '50%';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      id: id,
    };
    const dialogRef = this.dialog.open(TicketsDiag, dialogConfig);
  }

  actualizarTicket(id: number) {
    this.router.navigate(['/tickets/update', id], {
      relativeTo: this.route,
    });
    console.log('este es el id', id);
  }
}
