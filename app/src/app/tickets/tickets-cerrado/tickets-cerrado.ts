import { Component, computed, effect, Inject, inject, signal } from '@angular/core';
import { from, Subject, takeUntil } from 'rxjs';
import { TicketsModel } from '../../share/models/TicketsModel';
import { HistorialEstadoModel } from '../../share/models/HistorialEstadoModel';
import { ImagesModel } from '../../share/models/ImagesModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../share/services/app/notification.service';
import { TicketsService } from '../../share/services/api/tickets.service';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValoracionService } from '../../share/services/api/valoracion.service';
import { ValoracionModel } from '../../share/models/ValoracionModel';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tickets-cerrado',
  standalone: false,
  templateUrl: './tickets-cerrado.html',
  styleUrl: './tickets-cerrado.css',
})
export class TicketsCerrado {
  // Signals
  datosTicket = signal<TicketsModel | null>(null);
  usuario = signal<UsuarioModel | null>(null);

  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number };

  // imágenes
  selectedImages: { file: File; preview: string }[] = [];
  imageFileNames: string[] = [];

  // Formulario reactivo
  AsignacionForm!: FormGroup;

  // notificación y ciclo de vida
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private vjServiceTicket = inject(TicketsService);
  private vjServiceUser = inject(UsuarioService);
  private vjServiceValoracion = inject(ValoracionService);
  private dialogRef = inject(MatDialogRef<TicketsCerrado>);

  private authService = inject(AuthenticationService);
  /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  readonly idUsuario = computed(() => this.currentUser()?.id_usuario ?? 0);

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { id: number },
    private noti: NotificationService,
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService
  ) {
    this.datosDialog = data;

    if (this.datosDialog?.id) {
      this.obtenerTicket(this.datosDialog.id);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      observaciones: [null, [Validators.required, Validators.minLength(2)]],
      imagenes: [null, Validators.required],
      comentario: [null, [Validators.required, Validators.minLength(2)]],
      valoracion: [null, Validators.required],
      aceptacion: [null], // ⚡ faltaba este control
    });
  }

  ngOnInit(): void {
    this.AsignacionForm = this.initForm();
  }

  private obtenerTicket(id: number) {
    from(this.vjServiceTicket.getById(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticket: TicketsModel) => {
          this.datosTicket.set(ticket);

          // 👇 Verifica si el ticket tiene asignaciones
          const primeraAsignacion = ticket.asignaciones?.[0];
          if (primeraAsignacion?.id_tecnico) {
            this.obtenerTecnico(primeraAsignacion.id_tecnico);
          } else {
            console.warn('⚠️ El ticket no tiene asignaciones');
          }
        },
        error: (err: any) => console.error('❌ Error cargando ticket:', err),
      });
  }

  private obtenerTecnico(id_tecnico: number) {
    from(this.vjServiceUser.getById(id_tecnico))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario: UsuarioModel) => {
          this.usuario.set(usuario);
        },
        error: (err: any) => console.error('❌ Error cargando técnico:', err),
      });
  }

  close() {
    this.dialogRef.close();
  }

  TicketCerrado(): void {
    const ticket = this.datosTicket();
    const tecnico = this.usuario();

    if (!ticket?.id_ticket || !tecnico?.id_usuario) {
  this.noti.error(
    this.translate.instant('TICKET.ERROR_TITLE'),
    this.translate.instant('TICKET.ERROR_MISSING_DATA'),
    3000
  );
  return;
}

    this.AsignacionForm.markAllAsTouched();
if (this.AsignacionForm.invalid) {
  this.noti.error(
    this.translate.instant('TICKET.ERROR_FORM_TITLE'),
    this.translate.instant('TICKET.ERROR_FORM_MESSAGE'),
    5000
  );
  return;
}

    const formValue = this.AsignacionForm.value;
    const imagenes: ImagesModel[] = this.imageFileNames.map((fileName: string) => ({
      ruta_imagen: fileName,
    }));

    const user = this.currentUser(); // ejecuta el signal
    const idUsuario = user?.id_usuario;
    if (!idUsuario) {
      console.warn('⚠️ No hay usuario logueado todavía');
      return;
    }

    const payloadHistorial: HistorialEstadoModel[] = [
      {
        id: 0,
        id_historial: 0,
        estado_anterior: ticket.estado ?? 'Resuelto',
        nuevo_estado: 'Cerrado',
        observaciones: formValue.observaciones,
        fecha_cambio: new Date(),
        id_ticket: ticket.id_ticket,
        id_usuario: idUsuario,
        Imagenes_Ticket: imagenes,
      },
    ];

    const payloadTickets: TicketsModel = {
      id: tecnico.id_usuario,
      id_ticket: ticket.id_ticket,
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      fecha_creacion: ticket.fecha_creacion,
      fecha_cierre: new Date(),
      estado: 'Cerrado',
      prioridad: formValue.prioridad,
      id_categoria: formValue.id_categoria,
      id_usuario_cliente: tecnico.id_usuario,
      Historial_Estados: payloadHistorial,
      aceptacion: formValue.aceptacion,
    };

    const payloadValoracion: ValoracionModel = {
      id: 0,
      id_valoracion: 0,
      puntuacion: formValue.valoracion,
      comentario: formValue.comentario,
      fecha: new Date(),
      id_ticket: ticket.id_ticket,
    };

    console.log('📦 Payload Tickets:', JSON.stringify(payloadTickets, null, 2));

    this.vjServiceTicket
      .update(payloadTickets)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vjServiceValoracion
            .create(payloadValoracion)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.noti.success(
              this.translate.instant('TICKET.SUCCESS_CLOSE_TITLE'),
              this.translate.instant('TICKET.SUCCESS_CLOSE_MESSAGE', { id: ticket.id_ticket }),
              3000,
              '/tickets'
            );
            this.close();
              },
              error: (err: any) => {
                console.error('❌ Error al guardar valoración:', err);
                this.noti.error(
              this.translate.instant('TICKET.ERROR_TITLE'),
              this.translate.instant('TICKET.ERROR_VALORATION'),
              3000
            );
              },
            });
        },
        error: (err: any) => {
          console.error('❌ Error al cerrar ticket:', err);
          this.noti.error(
        this.translate.instant('TICKET.ERROR_TITLE'),
        this.translate.instant('TICKET.ERROR_CLOSE'),
        3000
      );
        },
      });
  }

  selectFiles(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push({ file, preview: e.target.result });
        this.imageFileNames.push(file.name);
        this.AsignacionForm.get('imagenes')?.setValue(
          this.imageFileNames.length > 0 ? this.imageFileNames : null
        );
        this.AsignacionForm.get('imagenes')?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }

  removeImage(img: any): void {
    this.selectedImages = this.selectedImages.filter((i) => i !== img);
    this.AsignacionForm.get('imagenes')?.setValue(
      this.selectedImages.length > 0 ? this.selectedImages : null
    );
    this.AsignacionForm.get('imagenes')?.updateValueAndValidity();
  }

  setAceptacion(valor: 'Si' | 'No'): void {
    this.AsignacionForm.patchValue({ aceptacion: valor });
  }

  onReset() {
    this.AsignacionForm.reset();
  }

  onBack() {
    this.router.navigate(['/tickets-proceso']);
  }
}
