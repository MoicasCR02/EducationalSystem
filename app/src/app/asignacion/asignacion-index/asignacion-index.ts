import { Component, computed, inject, signal } from '@angular/core';
import { AsignacionModel } from '../../share/models/AsignacionModel';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-asignacion-index',
  standalone: false,
  templateUrl: './asignacion-index.html',
  styleUrls: ['./asignacion-index.css'],
})
export class AsignacionIndex {
  datos = signal<AsignacionModel[]>([]);
  diasFiltrados: Date[] = [];

  // valores seleccionados en el rango
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  locale: string;

  private authService = inject(AuthenticationService);
  /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  readonly idUsuario = computed(() => this.currentUser()?.id_usuario ?? 0);


  constructor(
    private vjService: AsignacionService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.listAsignaciones();
    this.generarSemanaDesde(new Date());
    this.locale = this.translate.currentLang === 'en' ? 'en-US' : 'es-ES';

    this.translate.onLangChange.subscribe((event) => {
      this.locale = event.lang === 'en' ? 'en-US' : 'es-ES';
      this.generarSemanaDesde(new Date()); // refrescar semana
    });
  }

  onDateChange() {
    if (this.fechaInicio && this.fechaFin) {
      this.filtrarPorRango(this.fechaInicio, this.fechaFin);
    }
  }

  filtrarPorRango(start: Date, end: Date) {
    const dias: Date[] = [];
    const actual = new Date(start);

    while (actual <= end) {
      dias.push(new Date(actual));
      actual.setDate(actual.getDate() + 1);
    }

    this.diasFiltrados = dias;
  }

  generarSemanaDesde(fecha: Date) {
    const primerDia = new Date(fecha);
    primerDia.setDate(fecha.getDate() - fecha.getDay()); // domingo

    this.diasFiltrados = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(primerDia);
      d.setDate(primerDia.getDate() + i);
      return d;
    });
  }

  listAsignaciones() {
    const user = this.currentUser(); // ejecuta el signal
    const idUsuario = user?.id_usuario;

    if (!idUsuario) {
      console.warn('⚠️ No hay usuario logueado todavía');
      return;
    }
    this.vjService.getByUser(idUsuario).subscribe((respuesta: AsignacionModel[]) => {
      this.datos.set(respuesta);
    });
  }

  detalle(id: number) {
    this.router.navigate(['/tickets/', id]);
  }

  asignacionesPorDia(): { [key: string]: AsignacionModel[] } {
    const agrupados: { [key: string]: AsignacionModel[] } = {};
    const currentLang = this.translate.currentLang || 'es';
    this.locale = currentLang === 'en' ? 'en-US' : 'es-ES';
    console.log(this.locale);
    // Inicializar todos los días del rango como vacíos
    this.diasFiltrados.forEach((d) => {
      const clave = d.toLocaleDateString(this.locale, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
      agrupados[clave] = [];
    });

    const lista = this.datos() ?? [];

    lista.forEach((asignacion) => {
      const fechaCreacion = asignacion.ticket?.fecha_creacion;
      if (!fechaCreacion) return;

      const fecha = new Date(fechaCreacion);

      if (this.diasFiltrados.some((d) => d.toDateString() === fecha.toDateString())) {
        const clave = fecha.toLocaleDateString(this.locale, {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        });
        agrupados[clave].push(asignacion);
      }
    });

    return agrupados;
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'Asignado':
        return 'estado-asignado';
      case 'En Proceso':
        return 'estado-proceso';
      case 'Resuelto':
        return 'estado-resuelto';
      case 'Cerrado':
        return 'estado-cerrado';
      default:
        return 'estado-desconocido';
    }
  }
}
