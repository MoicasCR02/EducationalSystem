import { Component, inject, signal, OnDestroy, OnInit, computed } from '@angular/core';
import { TicketsModel } from '../../share/models/TicketsModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TicketsAsignacion } from '../tickets-asignacion/tickets-asignacion';
import { TicketsProceso } from '../tickets-proceso/tickets-proceso';
import { TicketsResuelto } from '../tickets-resuelto/tickets-resuelto';
import { TicketsCerrado } from '../tickets-cerrado/tickets-cerrado';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-tickets-detail',
  standalone: false,
  templateUrl: './tickets-detail.html',
  styleUrl: './tickets-detail.css',
})
export class TicketsDetail {
  //Signal para almacenar los datos del ticket
  datos = signal<TicketsModel | null>(null);
   private router = inject(Router);
    private authService = inject(AuthenticationService);
  
  
     /** Signals de usuario logueado */
    readonly isAuthenticated = this.authService.authenticated;
    readonly currentUser = this.authService.usuario;
  
     /** Control de roles */
  readonly role = computed(() => {
    const user = this.currentUser();
    return typeof user?.id_rol === 'string'
      ? user.id_rol                 // ej. "ADMIN"
      : user?.id_rol ?? null;
  });
    readonly isAdmin = computed(() => this.role() === 'ADMIN');
    readonly isUser = computed(() => this.role() === 'USER');
    readonly isTecnico = computed(() => this.role() === 'TECNICO');
  

  // Derivar idUsuario siempre sincronizado
  readonly idUsuario = computed(() => this.currentUser()?.id ?? 0);
  //Para sacar el modal
  readonly dialog = inject(MatDialog);

  // Signal para el cronómetro
  tiempoRestanteRespuesta = signal<string>('');
  tiempoRestanteResolucion = signal<string>('');
  // Inyectar servicios
  private vjService = inject(TicketsService);
  private route = inject(ActivatedRoute);


  private intervalIdRespuesta: any;
  private intervalIdResolucion: any;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.obtenerTicket(id);
    }
    this.role();
    console.log('aakhskdd ' + JSON.stringify(this.currentUser(), null, 2));
  }

  // Obtener Categoria y actualizar la Signal
  obtenerTicket(id: number) {
    this.vjService.getById(id).subscribe((data: TicketsModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

  ngOnInit(): void {
    // Iniciar ambos cronómetros
    this.intervalIdRespuesta = setInterval(() => this.actualizarCronometroRespuesta(), 1000);
    this.intervalIdResolucion = setInterval(() => this.actualizarCronometroResolucion(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalIdRespuesta) clearInterval(this.intervalIdRespuesta);
    if (this.intervalIdResolucion) clearInterval(this.intervalIdResolucion);
  }

  goBack(): void {
    this.router.navigate(['/tickets/']);
  }

  diasResolucion(): number {
    const ticket = this.datos(); // obtener el valor actual del signal
    if (!ticket?.fecha_creacion || !ticket?.fecha_cierre) return 0;

    const inicio = new Date(ticket.fecha_creacion);
    const fin = new Date(ticket.fecha_cierre);

    const diffMs = fin.getTime() - inicio.getTime(); // diferencia en ms
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // convertir a días
  }

  fechaLimiteRespuesta(): Date {
    const ticket = this.datos(); // obtener valor de la signal
    const horas = ticket?.categoria?.sla?.tiempo_max_respuesta; // usa el que tengas

    if (!ticket?.fecha_creacion || !horas || horas <= 0) {
      return new Date(NaN); // indica inválido
    }

    const inicio = new Date(ticket.fecha_creacion);
    // Sumamos horas (en milisegundos)
    const limite = new Date(inicio.getTime() + horas * 60 * 60 * 1000);
    return limite;
  }

  fechaLimiteResolucion(): Date {
    const ticket = this.datos(); // obtener valor de la signal
    const horas = ticket?.categoria?.sla?.tiempo_max_resolucion; // usa el que tengas

    if (!ticket?.fecha_creacion || !horas || horas <= 0) {
      return new Date(NaN); // indica inválido
    }

    const inicio = new Date(ticket.fecha_creacion);
    // Sumamos horas (en milisegundos)
    const limite = new Date(inicio.getTime() + horas * 60 * 60 * 1000);
    return limite;
  }

  // 🔹 Cronómetro genérico
  private calcularTiempoRestante(limite: Date): string {
    if (isNaN(limite.getTime())) return 'Fecha límite inválida';

    const ahora = new Date().getTime();
    const diffMs = limite.getTime() - ahora;

    if (diffMs <= 0) return 'Tiempo agotado';

    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  }

  // 🔹 Actualizar cronómetro de respuesta
  private actualizarCronometroRespuesta(): void {
    this.tiempoRestanteRespuesta.set(this.calcularTiempoRestante(this.fechaLimiteRespuesta()));
  }

  // 🔹 Actualizar cronómetro de resolución
  private actualizarCronometroResolucion(): void {
    this.tiempoRestanteResolucion.set(this.calcularTiempoRestante(this.fechaLimiteResolucion()));
  }

  asignarTicket(id_ticket?: number): void {
    this.dialog.open(TicketsAsignacion, {
      panelClass: 'custom-dialog-container',
      data: { id: id_ticket },
    });
  }

  procesarTicket(id_ticket?: number): void {
    this.dialog.open(TicketsProceso, {
      panelClass: 'custom-dialog-container',
      data: { id: id_ticket },
    });
  }

  ResolverTicket(id_ticket?: number): void {
    this.dialog.open(TicketsResuelto, {
      panelClass: 'custom-dialog-container',
      data: { id: id_ticket },
    });
  }

  CerrarTicket(id_ticket?: number): void {
    this.dialog.open(TicketsCerrado, {
      panelClass: 'custom-dialog-container',
      data: { id: id_ticket },
    });
  }
}
