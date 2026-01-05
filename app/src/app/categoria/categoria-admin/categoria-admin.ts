import { Component, inject, signal, ViewChild } from '@angular/core';
import {  MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { CategoriaDiag } from '../categoria-diag/categoria-diag';

@Component({
  selector: 'app-categoria-admin',
  standalone: false,
  templateUrl: './categoria-admin.html',
  styleUrl: './categoria-admin.css',
})
export class CategoriaAdmin {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //Cambio CategoriaModel
  dataSource = new MatTableDataSource<CategoriaModel>();
   // Signals
  categorias = signal<CategoriaModel[]>([]);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['nombre', 'descripcion', 'acciones'];
  
  readonly dialog = inject(MatDialog);

  constructor(
    private vjService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.listCategorias()
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
  listCategorias() {
    //localhost:3000/videojuego
    this.vjService.get().subscribe((respuesta: CategoriaModel[]) => {
      console.log(respuesta);
      //Cambio
      this.categorias.set(respuesta);
      this.dataSource.data=this.categorias()
       // Actualiza la signal
      this.categorias.set(respuesta);

      // Actualiza dataSource.data
      this.dataSource.data = this.categorias();

      // Re-asignar paginator y sort después de cambiar los datos
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  detalleCategoria(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '50%';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      id: id,
    };
    const dialogRef = this.dialog.open(CategoriaDiag, dialogConfig);
  }
  actualizarCategoria(id: number) {
    this.router.navigate(['/categorias/update', id], {
      relativeTo: this.route,
    });
    console.log("este es el id",id)
  }

  crearCategoria() {
  console.log("Ruta actual:", this.router.url); // 👈 muestra la URL actual
  this.router.navigate(['/categorias/create'], {
    relativeTo: this.route,
  });
}

}
