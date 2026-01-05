import { Component, computed, effect, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { from, Subject, takeUntil } from 'rxjs';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { TicketsAsignacion } from '../tickets-asignacion/tickets-asignacion';
import { NotificationService } from '../../share/services/app/notification.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { TicketsModel } from '../../share/models/TicketsModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HistorialEstadoModel } from '../../share/models/HistorialEstadoModel';
import { ImagesModel } from '../../share/models/ImagesModel';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tickets-proceso',
  standalone: false,
  templateUrl: './tickets-proceso.html',
  styleUrl: './tickets-proceso.css',
})
export class TicketsProceso {
  // Signal para almacenar el videojuego obtenido del API
  datosTicket = signal<TicketsModel | null>(null);
  usuario = signal<UsuarioModel | null>(null);
  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number }; // este id es el id del ticket

  //imagenes
  selectedImages: { file: File; preview: string }[] = [];
  imageFileNames: string[] = [];

  //Form para llenar la observacion
  // Formulario reactivo
  AsignacionForm!: FormGroup;

  // noti
  private destroy$ = new Subject<void>();

  // Inyectar servicios
  private vjService = inject(TicketsService);
  private vjServiceUser = inject(UsuarioService);
  private dialogRef = inject(MatDialogRef<TicketsAsignacion>);
  // Inyectar servicios
  private vjServiceAsignacion = inject(AsignacionService);
  private vjServiceTicket = inject(TicketsService);

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

    // Si hay ID, cargar los datos del tecnico
    if (this.datosDialog?.id) {
      this.obtenerTicket(this.datosDialog.id);
      this.obtenerTecnico(2);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      observaciones: [null, [Validators.required, Validators.minLength(2)]],
      imagenes: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.AsignacionForm = this.initForm();
  }

  // Cargar ticket usando Signals y effect
  private obtenerTicket(id: number) {
    const ticket$ = from(this.vjService.getById(id));

    effect(() => {
      ticket$.subscribe({
        next: (ticket: TicketsModel) => {
          console.log('📥 Ticket recibido del servicio:', ticket);

          // guardar directamente el ticket
          this.datosTicket.set(ticket);

          console.log('📦 Signal ticket actualizado:', this.datosTicket());
        },
        error: (err) => console.error('❌ Error cargando ticket:', err),
      });
    });
  }

  // Cargar ticket usando Signals y effect
  private obtenerTecnico(id: number) {
    from(this.vjServiceUser.getById(2)) // cambiar por tecnico logeuado
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario: UsuarioModel) => {
          console.log('📥 Técnico recibido del servicio:', usuario);

          // guardar directamente el técnico en el signal
          this.usuario.set(usuario);

          console.log('📦 Signal técnico actualizado:', this.usuario());
        },
        error: (err) => console.error('❌ Error cargando técnico:', err),
      });
  }

  // Cerrar diálogo
  close() {
    this.dialogRef.close();
  }

  // Método para asignar ticket a un técnico
  TicketResuelto(): void {
    const ticket = this.datosTicket();
    const tecnico = this.usuario();

    if (!ticket?.id_ticket) {
      console.error('❌ No se recibió id_ticket');
      return;
    }
    if (!tecnico?.id_usuario) {
      console.error('❌ No se recibió id_usuario');
      return;
    }

    this.AsignacionForm.markAllAsTouched();

    if (this.AsignacionForm.invalid) {
      this.noti.error(
        this.translate.instant('ASSIGN.ERROR_FORM_TITLE'),
        this.translate.instant('ASSIGN.ERROR_FORM_MESSAGE'),
        5000
      );
      return;
    }

    console.log('📤 Ticket a asignar:', ticket.id_ticket);
    console.log('👨‍🔧 Técnico seleccionado:', tecnico.id_usuario);

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
    // Crear historial
    const payloadHistorial: HistorialEstadoModel[] = [
      {
        id: 0,
        id_historial: 0,
        estado_anterior: 'Asignado',
        nuevo_estado: 'En Proceso',
        observaciones: formValue.observaciones,
        fecha_cambio: new Date(),
        id_ticket: ticket.id_ticket,
        id_usuario: idUsuario, // cambiar por usuario logueado
        Imagenes_Ticket: imagenes,
      },
    ];

    // Crear ticket
    const payloadTickets: TicketsModel = {
      id: ticket.id_ticket,
      id_ticket: ticket.id_ticket,
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      fecha_creacion: new Date(),
      fecha_cierre: null,
      estado: 'En Proceso',
      prioridad: formValue.prioridad,
      id_categoria: formValue.id_categoria,
      id_usuario_cliente: tecnico.id_usuario,
      Historial_Estados: payloadHistorial,
      aceptacion: formValue.aceptacion,
    };

    this.vjServiceTicket
      .update(payloadTickets)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          console.log('✅ Se comenzó con el proceso del ticket', resp);
          this.noti.success(
            this.translate.instant('TICKET.PROCESS_TITLE'),
            this.translate.instant('TICKET.PROCESS_MESSAGE', {
              id: ticket.id_ticket,
              user: tecnico.id_usuario,
            }),
            3000,
            '/tickets'
          );
          this.close();
        },
        error: (err) => {
          console.error('❌ Error ticket:', err);
          this.noti.error(
            this.translate.instant('TICKET.ERROR_TITLE'),
            this.translate.instant('TICKET.ERROR_PROCESS'),
            3000
          );
        },
      });
  }

  // Método para seleccionar archivos (sin id_usuario)
  selectFiles(event: any): void {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedImages.push({ file, preview: e.target.result });
        this.imageFileNames.push(file.name);

        // ✅ Actualiza el control con nombres de archivo
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

  /**
   * Navega de regreso a la lista de videojuegos
   */
  onBack() {
    this.router.navigate(['/tickets-proceso']);
  }
}
