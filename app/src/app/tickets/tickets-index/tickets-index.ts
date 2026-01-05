import { Component, computed, inject, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketsModel } from '../../share/models/TicketsModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { CartService } from '../../share/services/app/cart.service';

@Component({
  selector: 'app-tickets-index',
  standalone: false,
  templateUrl: './tickets-index.html',
  styleUrl: './tickets-index.css',
})
export class TicketsIndex {
  // Signal
  //Respuesta del API
  datos = signal<TicketsModel[]>([]);

  private authService = inject(AuthenticationService);
  /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  readonly idUsuario = computed(() => this.currentUser()?.id_usuario ?? 0);


  /** Control de roles */
  readonly role = computed(() => {
    const user = this.currentUser();
    return typeof user?.id_rol === 'string'
      ? user.id_rol // ej. "ADMIN"
      : user?.id_rol ?? null;
  });
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isUser = computed(() => this.role() === 'USER');

  mostrarPendientes: boolean = false;

  constructor(private vjService: TicketsService, private router: Router,
    private route: ActivatedRoute) {
    this.listTickets();
    this.currentUser();
  }

  // Listar todos los Tickets del API // agregar en el id by user el currenUser
  listTickets() {
    const user = this.currentUser(); // ejecuta el signal
    const idUsuario = user?.id_usuario;

    if (!idUsuario) {
      console.warn('⚠️ No hay usuario logueado todavía');
      return;
    }
    this.vjService.getByUser(idUsuario).subscribe((respuesta: TicketsModel[]) => {
      console.log('Respuesta del backend:', respuesta);

      // 🔄 Convertir las fechas a tipo Date (si existen)
      const FechasConvertidas: TicketsModel[] = respuesta.map((ticket) => ({
        ...ticket,
        fecha_creacion: ticket.fecha_creacion ? new Date(ticket.fecha_creacion.toString()) : null,
        fecha_cierre: ticket.fecha_cierre ? new Date(ticket.fecha_cierre.toString()) : null,
      }));
      // Primero asignamos los datos
      this.datos.set(FechasConvertidas);

      // Luego imprimimos los IDs cargados
      const ids = this.datos().map((item) => item.id_ticket);
      const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);

      console.log('✅ IDs cargados:', ids);
      console.log('⚠️ Duplicados encontrados:', duplicados);
      const listaTickets = this.datos(); // obtienes el array actual de tickets
      console.log(typeof listaTickets[0].fecha_creacion, listaTickets[0].fecha_creacion);
    });
  }
  // Navegar al detalle de un usuario
  detalle(id: number) {
    this.router.navigate(['/tickets/', id]);
  }

  filteredTickets() {
    if (this.mostrarPendientes) {
      return this.datos().filter((t) => t.estado === 'Pendiente');
    }
    return this.datos();
  }

  toggleFiltroPendientes() {
    this.mostrarPendientes = !this.mostrarPendientes;
  }
    crearTicket() {
    console.log('Ruta actual:', this.router.url); // 👈 muestra la URL actual
    this.router.navigate(['/tickets/create'], {
      relativeTo: this.route,
    });
  }
}
