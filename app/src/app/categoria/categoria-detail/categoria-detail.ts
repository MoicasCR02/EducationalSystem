import { Component, inject, signal } from '@angular/core';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-categoria-detail',
  standalone: false,
  templateUrl: './categoria-detail.html',
  styleUrl: './categoria-detail.css',
})
export class CategoriaDetail {
   //Signal para almacenar los datos del videojuego
  datos = signal<CategoriaModel | null>(null);
  // Inyectar servicios
  private vjService = inject(CategoriaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor(){
    const id= Number(this.route.snapshot.paramMap.get('id'))
    if(!isNaN(id)){
      this.obtenerCategoria(id)
    }
  }

// Obtener Categoria y actualizar la Signal
  obtenerCategoria(id: number) {
    this.vjService.getById(id).subscribe((data: CategoriaModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

  goBack(): void {
    this.router.navigate(['/categorias/']);
  }
}
