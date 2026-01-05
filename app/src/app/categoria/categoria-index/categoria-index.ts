import { Component, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { Router } from '@angular/router';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { CategoriaService } from '../../share/services/api/categoria.service';

@Component({
  selector: 'app-categoria-index',
  standalone: false,
  templateUrl: './categoria-index.html',
  styleUrl: './categoria-index.css'
})
export class CategoriaIndex {
  // Signal
  //Respuesta del API
  datos = signal<CategoriaModel[]>([]);

  constructor(private vjService: CategoriaService,
    private router:Router
  ){
    this.listUsuarios()
  }

  

  // Listar todos los usuario del API
  listUsuarios() {
    this.vjService.get().subscribe((respuesta: CategoriaModel[]) => {
    console.log('Respuesta del backend:', respuesta);

    // Primero asignamos los datos
    this.datos.set(respuesta);

    // Luego imprimimos los IDs cargados
    const ids = this.datos().map(item => item.id_categoria);
    const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);

    console.log('✅ IDs cargados:', ids);
    console.log('⚠️ Duplicados encontrados:', duplicados);
    });
  }
  // Navegar al detalle de un usuario
  detalle(id: number) {
    this.router.navigate(['/categorias/', id]);
  }

  
}
