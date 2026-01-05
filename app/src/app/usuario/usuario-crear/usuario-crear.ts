import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { UsuarioDiag } from '../usuario-diag/usuario-diag';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-usuario-crear',
  standalone: false,
  templateUrl: './usuario-crear.html',
  styleUrl: './usuario-crear.css',
})
export class UsuarioCrear {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //Cambio TicketsModel
  dataSource = new MatTableDataSource<UsuarioModel>();
  // Signals
  tecnicos = signal<UsuarioModel[]>([]);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['nombre', 'correo', 'ultimo_inicio_sesion', 'activo', 'id_rol', 'acciones'];

  mostrarSoloAdmins = false; // filtrar admins

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
    this.vjService.getusuarios().subscribe((respuesta: UsuarioModel[]) => {
      console.log(respuesta);

      // 👉 Filtrar solo ADMIN y USER
      const filtrados = respuesta.filter(
        (usuario) => usuario.id_rol === 'ADMIN' || usuario.id_rol === 'USER'
      );

      // Actualiza la signal con los filtrados
      this.tecnicos.set(filtrados);

      // Actualiza dataSource.data
      this.dataSource.data = this.tecnicos();

      // Re-asignar paginator y sort después de cambiar los datos
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  toggleFiltroAdmins() {
    this.mostrarSoloAdmins = !this.mostrarSoloAdmins;

    if (this.mostrarSoloAdmins) {
      // 👉 Filtrar solo ADMIN
      const filtrados = this.tecnicos().filter((usuario) => usuario.id_rol === 'ADMIN');
      this.dataSource.data = filtrados;
    } else {
      // 👉 Mostrar todos
      this.dataSource.data = this.tecnicos();
    }

    // Re-asignar paginator y sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  crearUsuario() {
    console.log('Ruta actual:', this.router.url); // 👈 muestra la URL actual
    this.router.navigate(['/usuarios/createnuevo'], {
      relativeTo: this.route,
    });
    console.log(this.route);
  }

  actualizarUsuario(id: number) {
    this.router.navigate(['/usuarios/updatenuevo', id], {
      relativeTo: this.route,
    });
    console.log('este es el id', id);
  }
}
