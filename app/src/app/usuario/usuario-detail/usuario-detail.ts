import { Component, inject, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-usuario-detail',
  standalone: false,
  templateUrl: './usuario-detail.html',
  styleUrl: './usuario-detail.css'
})
export class UsuarioDetail {
  // Signal para almacenar los datos del videojuego
  datos = signal<UsuarioModel | null>(null);
  // Inyectar servicios
  private vjService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor(){
    const id= Number(this.route.snapshot.paramMap.get('id'))
    if(!isNaN(id)){
      this.obtenerUsuario(id)
    }
  }

// Obtener videojuego y actualizar la Signal
  obtenerUsuario(id: number) {
    this.vjService.getById(id).subscribe((data: UsuarioModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

  goBack(): void {
    this.router.navigate(['/usuarios/']);
  }

}
