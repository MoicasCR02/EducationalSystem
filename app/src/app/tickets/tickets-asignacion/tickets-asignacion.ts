import { Component, computed, effect, Inject, inject, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { from, Subject, takeUntil } from 'rxjs';
import { TicketsModel } from '../../share/models/TicketsModel';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImagesModel } from '../../share/models/ImagesModel';
import { TicketsService } from '../../share/services/api/tickets.service';
import { HistorialEstadoModel } from '../../share/models/HistorialEstadoModel';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TranslateService } from '@ngx-translate/core';

export interface GetByCategoriaResponse {
  ticket: TicketsModel;
  tecnicos: UsuarioModel[];
}

@Component({
  selector: 'app-tickets-asignacion',
  standalone: false,
  templateUrl: './tickets-asignacion.html',
  styleUrl: './tickets-asignacion.css',
})
export class TicketsAsignacion {
  // Signal para almacenar el videojuego obtenido del API

  datosUsuario = signal<UsuarioModel[] | null>(null);
  datosTicket = signal<TicketsModel | null>(null);

  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number }; // este id es el id del ticket

  AsignacionForm!: FormGroup;
  formsPorTecnico: { [id_usuario: number]: FormGroup } = {};
  // noti
  private destroy$ = new Subject<void>();

  //imagenes
  selectedImages: { file: File; preview: string }[] = [];
  imageFileNames: string[] = [];
  selectedImagesPorTecnico: { [id_usuario: number]: { file: File; preview: string }[] } = {};
  imageFileNamesPorTecnico: { [id_usuario: number]: string[] } = {};
  // Inyectar servicios
  private vjService = inject(UsuarioService);
  private vjServiceAsignacion = inject(AsignacionService);
  private vjServiceTicket = inject(TicketsService);
  private dialogRef = inject(MatDialogRef<TicketsAsignacion>);

  private authService = inject(AuthenticationService);
  /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  readonly idUsuario = computed(() => this.currentUser()?.id_usuario ?? 0);

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { id: number },
    private noti: NotificationService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.datosDialog = data;

    // Si hay ID, cargar los datos del tecnico
    if (this.datosDialog?.id) {
      this.obtenerTecnicos(this.datosDialog.id);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      observaciones: [null, [Validators.required, Validators.minLength(2)]],
      imagenes: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Form base (opcional, si lo usas en otro lado)
    this.AsignacionForm = this.initForm();
  }

  getControl(id_usuario: number, controlName: string): AbstractControl | null {
    const form = this.formsPorTecnico[id_usuario];
    return form?.get(controlName) ?? null;
  }

  //a Partir de el id ticket tengo que cargar los tecnicos relacionados con la categoria del ticket

  // Cargar tecnico usando Signals y effect
  private obtenerTecnicos(id: number) {
    const ticket$ = from(this.vjService.getByCategoriaP(id));

    effect(() => {
      ticket$.subscribe({
        next: (data: GetByCategoriaResponse) => {
          console.log('📥 Datos recibidos del servicio:', data);

          // separar ticket y tecnicos
          this.datosTicket.set(data.ticket);

          // ⚡ Filtrar técnicos: solo mostrar los que tengan carga_actual <= 5
          const tecnicosFiltrados = data.tecnicos.filter(
            (tecnico: UsuarioModel) => (tecnico.carga_actual ?? 0) < 5
          );

          // Si no queda ningún técnico, asignar null
          if (tecnicosFiltrados.length === 0) {
            this.datosUsuario.set(null as any); // o undefined según tu modelo
          } else {
            this.datosUsuario.set(tecnicosFiltrados);
          }

          // ✅ Crear forms por cada técnico filtrado
          tecnicosFiltrados.forEach((tecnico: UsuarioModel) => {
            this.formsPorTecnico[tecnico.id_usuario] = this.initForm();
            this.selectedImagesPorTecnico[tecnico.id_usuario] = [];
            this.imageFileNamesPorTecnico[tecnico.id_usuario] = [];
          });

          console.log('📦 Signal ticket actualizado:', this.datosTicket());
          console.log('📦 Técnicos filtrados:', this.datosUsuario());
        },
        error: (err) => console.error('❌ Error cargando categorias:', err),
      });
    });
  }

  // Cerrar diálogo
  close() {
    this.dialogRef.close();
  }

  // Método para asignar ticket a un técnico
  asignarTicket(id_ticket: number | undefined, id_usuario: number): void {
    if (!id_ticket) {
      console.error('❌ No se recibió id_ticket');
      return;
    }

    const form = this.formsPorTecnico[id_usuario];
    console.log('Valor imagenes:', form.get('imagenes')?.value);
    console.log('Valid imagenes?', form.get('imagenes')?.valid);

    form.markAllAsTouched();

    if (form.invalid) {
      this.noti.error('Formulario Inválido', 'Revise los campos marcados.', 5000);
      return;
    }

    console.log('📤 Ticket a asignar:', id_ticket);
    console.log('👨‍🔧 Técnico seleccionado:', id_usuario);

    const formValue = form.value;
    const imagenes: ImagesModel[] = (this.imageFileNamesPorTecnico[id_usuario] ?? []).map(
      (fileName: string) => ({
        ruta_imagen: fileName,
      })
    );

    const user = this.currentUser(); // ejecuta el signal
    const idUsuario = user?.id_usuario;

    if (!idUsuario) {
      console.warn('⚠️ No hay usuario logueado todavía');
      return;
    }

    // Crear asignación
    const payloadHistorial: HistorialEstadoModel[] = [
      {
        id: 0,
        id_historial: 0,
        estado_anterior: 'Pendiente',
        nuevo_estado: 'Asignado',
        observaciones: formValue.observaciones,
        fecha_cambio: new Date(),
        id_ticket: id_ticket,
        id_usuario: idUsuario,
        Imagenes_Ticket: imagenes,
      },
    ];

    const payloadTickets: TicketsModel = {
      id: id_usuario,
      id_ticket: id_ticket,
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      fecha_creacion: new Date(),
      fecha_cierre: null,
      estado: 'Asignado',
      prioridad: formValue.prioridad,
      id_categoria: formValue.id_categoria,
      id_usuario_cliente: idUsuario,
      Historial_Estados: payloadHistorial,
      aceptacion: formValue.aceptacion,
    };

    console.log('Payload:', JSON.stringify(payloadTickets, null, 2));

    this.vjServiceTicket
      .update(payloadTickets)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => console.log('✅ Ticket actualizado:', resp),
        error: (err) => console.error('❌ Error al actualizar ticket:', err),
      });

    this.vjServiceAsignacion
      .create({
        fecha_asignacion: new Date(),
        metodo: 'Manual',
        id_ticket: id_ticket,
        id_tecnico: id_usuario,
        id_reglaAutotriage: 1,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          console.log('✅ Ticket asignado correctamente:', resp);
          // Notificación directa (sin preguntar si es create/update)
          this.noti.success(
            this.translate.instant('ASSIGN.MANUAL_SUCCESS_TITLE'),
            this.translate.instant('ASSIGN.MANUAL_SUCCESS_MESSAGE', {
              id: id_ticket,
              user: id_usuario,
            }),
            3000,
            '/tickets'
          );

          this.close(); // cerrar el diálogo
        },
        error: (err) => {
          console.error('❌ Error al asignar ticket:', err);
          this.noti.error('Error', 'No se pudo asignar el ticket', 3000);
        },
      });
  }

  selectFiles(event: any, id_usuario: number): void {
    const files: FileList = event.target.files;

    if (!this.selectedImagesPorTecnico[id_usuario]) {
      this.selectedImagesPorTecnico[id_usuario] = [];
      this.imageFileNamesPorTecnico[id_usuario] = [];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedImagesPorTecnico[id_usuario].push({ file, preview: e.target.result });
        this.imageFileNamesPorTecnico[id_usuario].push(file.name);

        // ✅ guarda un valor simple para que Validators.required lo reconozca
        const hasImages = this.selectedImagesPorTecnico[id_usuario].length > 0;
        this.formsPorTecnico[id_usuario]
          .get('imagenes')
          ?.setValue(hasImages ? this.imageFileNamesPorTecnico[id_usuario] : null);
        this.formsPorTecnico[id_usuario].get('imagenes')?.updateValueAndValidity();
      };

      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  removeImage(img: any, id_usuario: number): void {
    this.selectedImagesPorTecnico[id_usuario] = this.selectedImagesPorTecnico[id_usuario].filter(
      (i) => i !== img
    );

    this.imageFileNamesPorTecnico[id_usuario] = this.selectedImagesPorTecnico[id_usuario].map(
      (i) => i.file.name
    );

    const hasImages = this.selectedImagesPorTecnico[id_usuario].length > 0;
    this.formsPorTecnico[id_usuario]
      .get('imagenes')
      ?.setValue(hasImages ? this.imageFileNamesPorTecnico[id_usuario] : null);
    this.formsPorTecnico[id_usuario].get('imagenes')?.updateValueAndValidity();
  }
}
