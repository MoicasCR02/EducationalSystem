import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { UsuarioDiag } from '../usuario-diag/usuario-diag';

@Component({
  selector: 'app-usuario-admin',
  standalone: false,
  templateUrl: './usuario-admin.html',
  styleUrl: './usuario-admin.css',
})
export class UsuarioAdmin {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //Cambio TicketsModel
  dataSource = new MatTableDataSource<UsuarioModel>();
  // Signals
  tecnicos = signal<UsuarioModel[]>([]);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['nombre', 'correo', 'acciones'];

  readonly dialog = inject(MatDialog);

  constructor(
    private vjService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.listTecnicos();
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
  listTecnicos() {
    //localhost:3000/videojuego
    this.vjService.get().subscribe((respuesta: UsuarioModel[]) => {
      console.log(respuesta);
      //Cambio
      this.tecnicos.set(respuesta);
      this.dataSource.data = this.tecnicos();
      // Actualiza la signal
      this.tecnicos.set(respuesta);

      // Actualiza dataSource.data
      this.dataSource.data = this.tecnicos();

      // Re-asignar paginator y sort después de cambiar los datos
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  detalleTecnico(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '50%';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      id: id,
    };
    const dialogRef = this.dialog.open(UsuarioDiag, dialogConfig);
  }
  actualizarTecnico(id: number) {
    this.router.navigate(['/usuarios/update', id], {
      relativeTo: this.route,
    });
    console.log('este es el id', id);
  }

  crearTecnico() {
    console.log('Ruta actual:', this.router.url); // 👈 muestra la URL actual
    this.router.navigate(['/usuarios/create'], {
      relativeTo: this.route,
    });
  }
}
