import { Component, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-index',
  standalone: false,
  templateUrl: './usuario-index.html',
  styleUrl: './usuario-index.css'
})
export class UsuarioIndex {
  // Signal
  //Respuesta del API
  datos = signal<UsuarioModel[]>([]);

  constructor(private vjService: UsuarioService,
    private router:Router
  ){
    this.listUsuarios()
  }

  // Listar todos los usuario del API
  listUsuarios() {
    this.vjService.get().subscribe((respuesta: UsuarioModel[]) => {
    console.log('Respuesta del backend:', respuesta);
    // Primero asignamos los datos
    this.datos.set(respuesta);
    });
  }
  // Navegar al detalle de un usuario
  detalle(id: number) {
    this.router.navigate(['/usuarios/', id]);
  }
}
