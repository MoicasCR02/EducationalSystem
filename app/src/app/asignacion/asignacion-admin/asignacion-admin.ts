import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AsignacionModel } from '../../share/models/AsignacionModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketsModel } from '../../share/models/TicketsModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { Reglas_AutotriageModel } from '../../share/models/ReglasAutotriageModel';
import { ReglasService } from '../../share/services/api/reglas_autotriage.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { TicketsExtendido } from '../../share/models/TicketsExtendidoModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-asignacion-admin',
  standalone: false,
  templateUrl: './asignacion-admin.html',
  styleUrl: './asignacion-admin.css',
})
export class AsignacionAdmin {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //Cambio TicketsModel
  dataSource = new MatTableDataSource<TicketsExtendido>();

  // Signals
  tickets = signal<TicketsExtendido[]>([]);
  reglas = signal<Reglas_AutotriageModel[]>([]);
  tecnicos = signal<UsuarioModel[]>([]);

  private authService = inject(AuthenticationService);
  /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  readonly idUsuario = computed(() => this.currentUser()?.id_usuario ?? 0);

  //Mostrar mis asignaciones
  asignaciones: {
    ticket: TicketsExtendido;
    tecnico: UsuarioModel;
    regla: Reglas_AutotriageModel | null;
  }[] = [];

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'titulo',
    'descripcion',
    'categoria',
    'prioridad',
    'TiempoRestante',
    'fecha_creacion',
    'Fecha_maxima',
    'campoCalculado',
  ];

  readonly dialog = inject(MatDialog);

  constructor(
    private vjService: TicketsService,
    private vjServiceReglas: ReglasService,
    private vjServiceTecnicos: UsuarioService,
    private vjServiceAsignacion: AsignacionService,
    private router: Router,
    private route: ActivatedRoute,
    private noti: NotificationService,
    private translate: TranslateService
  ) {
    this.listTickets();
    this.listTecnicos();
    this.listReglas();
  }

  ngOnInit() {
    //Label paginator
    this.paginator._intl.itemsPerPageLabel = 'Items';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.firstPageLabel = 'Inicio';
    this.paginator._intl.lastPageLabel = 'Fin';
  }

  listTecnicos() {
    this.vjServiceTecnicos.get().subscribe((respuesta: UsuarioModel[]) => {
      console.log('Respuesta del backend:', respuesta);
      // Primero asignamos los datos
      this.tecnicos.set(respuesta);
    });
  }

  listReglas() {
    this.vjServiceReglas.get().subscribe((respuesta: Reglas_AutotriageModel[]) => {
      console.log('Respuesta del backend:', respuesta);
      // Primero asignamos los datos
      this.reglas.set(respuesta);
    });
  }

  //Listar todos los videojuegos del API
  listTickets(): void {
    const user = this.currentUser(); // ejecuta el signal
    const idUsuario = user?.id_usuario;

    if (!idUsuario) {
      console.warn('⚠️ No hay usuario logueado todavía');
      return;
    }
    this.vjService.getByUser(idUsuario).subscribe((respuesta: TicketsModel[]) => {
      const pendientes = respuesta
        .filter((ticket) => ticket.estado === 'Pendiente')
        .map((ticket) => {
          const prioridadNum = this.prioridadToNumber(ticket.prioridad);
          const horasMax = ticket.categoria?.sla?.tiempo_max_resolucion ?? 0;
          const fechaCreacion = ticket.fecha_creacion
            ? new Date(ticket.fecha_creacion)
            : new Date(); // o puedes usar null, pero entonces debes manejarlo después
          const tiempoRestanteHoras = this.calcularTiempoRestanteHoras(horasMax, fechaCreacion);
          const puntaje = prioridadNum * 1000 - tiempoRestanteHoras;
          const fechaMaxResolucion = this.calcularFechaMaxResolucion(horasMax);
          return {
            ...ticket,
            campoCalculado: puntaje,
            tiempoRestante: tiempoRestanteHoras,
            fecha_maxima_resolucion: fechaMaxResolucion,
          };
        })
        .sort((a, b) => b.campoCalculado - a.campoCalculado);

      this.tickets.set(pendientes);
      this.dataSource.data = pendientes;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  //determinar el numero de la prioridad
  private prioridadToNumber(prioridad: string): number {
    switch (prioridad) {
      case 'Baja':
        return 1;
      case 'Media':
        return 2;
      case 'Alta':
        return 3;
      default:
        return 0;
    }
  }

  //calcular tiempo restante
  private calcularTiempoRestanteHoras(horasMax: number, fechaCreacion: Date): number {
    const ahora = new Date().getTime();
    const limite = new Date(fechaCreacion).getTime() + horasMax * 60 * 60 * 1000;
    const diffMs = limite - ahora;

    return diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60)) : 0;
  }

  private calcularFechaMaxResolucion(horasMax: number): Date {
    const ahora = new Date();
    return new Date(ahora.getTime() + horasMax * 60 * 60 * 1000);
  }

  asignarAutomaticamente() {
    // Recorrer tickets pendientes en orden
    this.tickets().forEach((ticket) => {
      const mejorTecnico = this.seleccionarTecnico(ticket);
      if (mejorTecnico.tecnico && mejorTecnico.reglaPrincipal) {
        const payload: AsignacionModel = {
          id_asignacion: 0, // el backend lo autoincrementa
          id_ticket: ticket.id_ticket,
          id_tecnico: mejorTecnico.tecnico.id_usuario,
          fecha_asignacion: new Date(),
          metodo: 'Automático',
          // ⚡ si no necesitas reglas, puedes dejarlo null o quitarlo del modelo
          id_reglaAutotriage: mejorTecnico.reglaPrincipal?.id_regla,
        };

        // Enviar al backend
        this.vjServiceAsignacion.create(payload).subscribe({
          next: (resp) =>
            console.log(
              `✅ Ticket ${ticket.id_ticket} asignado a ${mejorTecnico.tecnico?.nombre}`,
              resp
            ),
          error: (err) => console.error(`❌ Error al asignar ticket ${ticket.id_ticket}`, err),
        });
      } else {
        console.warn(`⚠️ Ticket ${ticket.id_ticket} no pudo ser asignado automáticamente`);
      }
    });
  }

  private seleccionarTecnico(ticket: TicketsExtendido): {
    tecnico: UsuarioModel | null;
    reglaPrincipal: Reglas_AutotriageModel | null;
  } {
    const reglas = this.reglas();

    // Filtrar técnicos por especialidad
    // Filtrar técnicos por especialidad y estado activo
    let tecnicosDisponibles = this.tecnicos().filter(
      (t) =>
        t.activo && // 👈 nuevo filtro
        t.especialidades?.some((espTec: EspecialidadModel) =>
          ticket.categoria?.especialidades?.some(
            (espCat: EspecialidadModel) => espCat.id_especialidad === espTec.id_especialidad
          )
        )
    );
    if (tecnicosDisponibles.length === 0) {
      setTimeout(() => {
        this.noti.error(
          this.translate.instant('ASSIGN.NOTI_NO_TECHS_TITLE'),
          this.translate.instant('ASSIGN.NOTI_NO_TECHS_MESSAGE', {
            category: ticket.categoria?.nombre,
          }),
          3000
        );
      }, 6000);
      return { tecnico: null, reglaPrincipal: null };
    }

    // ⚡ Nueva regla: excluir técnicos con carga > 6
    tecnicosDisponibles = tecnicosDisponibles.filter((t) => (t.carga_actual ?? 0) <= 6);

    if (tecnicosDisponibles.length === 0) {
      this.noti.warning(
        this.translate.instant('ASSIGN.NOTI_OVERLOAD_TITLE'),
        this.translate.instant('ASSIGN.NOTI_OVERLOAD_MESSAGE', { id: ticket.id_ticket }),
        3000
      );
      setTimeout(() => {
        this.noti.info(
          this.translate.instant('ASSIGN.NOTI_UNASSIGNED_TITLE'),
          this.translate.instant('ASSIGN.NOTI_UNASSIGNED_MESSAGE', { id: ticket.id_ticket }),
          3000
        );
      }, 6000);
      return { tecnico: null, reglaPrincipal: null };
    }

    // ⚡ Nueva regla: si no hay técnicos con carga ≤ 5, no se asigna
    const tecnicosConCargaAceptable = tecnicosDisponibles.filter((t) => (t.carga_actual ?? 0) <= 5);
    if (tecnicosConCargaAceptable.length === 0) {
      setTimeout(() => {
        this.noti.info(
          this.translate.instant('ASSIGN.NOTI_NO_ACCEPTABLE_TITLE'),
          this.translate.instant('ASSIGN.NOTI_NO_ACCEPTABLE_MESSAGE', { id: ticket.id_ticket }),
          3000,
          '/tickets-admin'
        );
      }, 6000);
      return { tecnico: null, reglaPrincipal: null };
    }

    // Evaluar técnicos disponibles
    const evaluaciones: {
      tecnico: UsuarioModel;
      puntaje: number;
      reglaPrincipal: Reglas_AutotriageModel | null;
    }[] = tecnicosConCargaAceptable.map((tecnico) => {
      let puntajeTotal = 0;
      let reglaPrincipal: Reglas_AutotriageModel | null = null;
      let maxAporte = -Infinity;

      reglas
        .filter((r) => r.activo)
        .forEach((regla) => {
          const aporte =
            regla.prioridad_base * this.prioridadToNumber(ticket.prioridad) +
            regla.peso_sla * ticket.tiempoRestante -
            regla.peso_carga * (tecnico.carga_actual ?? 0);

          puntajeTotal += aporte;

          if (aporte > maxAporte) {
            maxAporte = aporte;
            reglaPrincipal = regla;
          }
        });

      return { tecnico, puntaje: puntajeTotal, reglaPrincipal };
    });

    const mejor = evaluaciones.sort((a, b) => b.puntaje - a.puntaje)[0];

    if (mejor?.tecnico) {
      this.noti.success(
        this.translate.instant('ASSIGN.NOTI_ASSIGNED_TITLE'),
        this.translate.instant('ASSIGN.NOTI_ASSIGNED_MESSAGE', {
          id: ticket.id_ticket,
          name: mejor.tecnico.nombre,
        }),
        5000,
        '/tickets'
      );
      setTimeout(() => {
        this.noti.info(
          this.translate.instant('ASSIGN.NOTI_RULE_TITLE'),
          this.translate.instant('ASSIGN.NOTI_RULE_MESSAGE', {
            rule: mejor.reglaPrincipal?.nombre ?? 'Desconocida',
          }),
          2000
        );
      }, 1000);
    }
    return { tecnico: mejor?.tecnico ?? null, reglaPrincipal: mejor?.reglaPrincipal ?? null };
  }

  private asignarTecnico(ticket: TicketsExtendido): {
    tecnico: UsuarioModel | null;
    reglaPrincipal: Reglas_AutotriageModel | null;
  } {
    const reglas = this.reglas();

    // Filtrar técnicos por especialidad
    let tecnicosDisponibles = this.tecnicos().filter(
      (t) =>
        t.activo && // 👈 nuevo filtro
        t.especialidades?.some((espTec: EspecialidadModel) =>
          ticket.categoria?.especialidades?.some(
            (espCat: EspecialidadModel) => espCat.id_especialidad === espTec.id_especialidad
          )
        )
    );
    if (tecnicosDisponibles.length === 0) {
      return { tecnico: null, reglaPrincipal: null };
    }

    // Excluir técnicos con carga > 6
    tecnicosDisponibles = tecnicosDisponibles.filter((t) => (t.carga_actual ?? 0) < 5);
    if (tecnicosDisponibles.length === 0) {
      return { tecnico: null, reglaPrincipal: null };
    }

    // Excluir técnicos con carga > 5
    const tecnicosConCargaAceptable = tecnicosDisponibles.filter((t) => (t.carga_actual ?? 0) < 5);
    if (tecnicosConCargaAceptable.length === 0) {
      return { tecnico: null, reglaPrincipal: null };
    }

    // Evaluar técnicos disponibles
    const evaluaciones = tecnicosConCargaAceptable.map((tecnico) => {
      let puntajeTotal = 0;
      let reglaPrincipal: Reglas_AutotriageModel | null = null;
      let maxAporte = -Infinity;

      reglas
        .filter((r) => r.activo)
        .forEach((regla) => {
          const aporte =
            regla.prioridad_base * this.prioridadToNumber(ticket.prioridad) +
            regla.peso_sla * ticket.tiempoRestante -
            regla.peso_carga * (tecnico.carga_actual ?? 0);

          puntajeTotal += aporte;

          if (aporte > maxAporte) {
            maxAporte = aporte;
            reglaPrincipal = regla;
          }
        });

      return { tecnico, puntaje: puntajeTotal, reglaPrincipal };
    });

    const mejor = evaluaciones.sort((a, b) => b.puntaje - a.puntaje)[0];
    return { tecnico: mejor?.tecnico ?? null, reglaPrincipal: mejor?.reglaPrincipal ?? null };
  }

  mostrarAsignaciones(): void {
    this.asignaciones = []; // limpiar antes de recalcular

    (this.dataSource.data as TicketsExtendido[]).forEach((ticket) => {
      const resultado = this.asignarTecnico(ticket);
      this.asignaciones.push({
        ticket,
        tecnico: resultado.tecnico ?? ({ nombre: 'Sin técnico', id_usuario: 0 } as UsuarioModel),
        regla: resultado.reglaPrincipal,
      });
    });

    console.log('Asignaciones calculadas:', this.asignaciones);
  }
}
