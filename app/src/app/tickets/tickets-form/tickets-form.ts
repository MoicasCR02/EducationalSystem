import { Component, computed, signal } from '@angular/core';
import { EtiquetaModel } from '../../share/models/EtiquetasModel';
import { Subject, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketsService } from '../../share/services/api/tickets.service';
import { EtiquetaService } from '../../share/services/api/etiqueta.service';
import { FileUploadService } from '../../share/services/api/file-upload.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { minWordsValidator } from '../../share/validators/min-words-validator';
import { TicketsModel } from '../../share/models/TicketsModel';
import { forEachChild } from 'typescript';
import { PrioridadModel } from '../../share/models/PrioridadModel';
import { PrioridadService } from '../../share/services/api/prioridad.service';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { ImagesModel } from '../../share/models/ImagesModel';
import { HistorialEstadoModel } from '../../share/models/HistorialEstadoModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tickets-form',
  standalone: false,
  templateUrl: './tickets-form.html',
  styleUrl: './tickets-form.css',
})
export class TicketsForm {
  // Subject para controlar la destrucción de suscripciones y evitar memory leaks
  private destroy$ = new Subject<void>();

  // Título del formulario, id del videojuego y bandera de creación/actualización
  titleForm = 'Crear';
  idTicket: number | null = null;
  isCreate = true;

  // Listas de géneros y plataformas manejadas con Angular 20 signals
  readonly etiquetas = signal<EtiquetaModel[]>([]);
  etiquetasList = signal<EtiquetaModel[]>([]);
  prioridadList = signal<PrioridadModel[]>([]);

  searchEtiqueta = '';
  filteredEtiquetas: EtiquetaModel[] = [];
  categoriasEtiqueta: CategoriaModel[] = [];
  categoriaSeleccionada: CategoriaModel | null = null;

  selectedImages: { file: File; preview: string }[] = [];
  imageFileNames: string[] = [];

  // Formulario reactivo
  TicketForm!: FormGroup;

  // Variables para gestión de imagen
  currentFile?: File;
  preview = '';
  nameImage = 'image-not-found.jpg';
  previousImage: string | null = null;

  // Expresiones regulares para validaciones
  number4digits = /^\d{4}$/;
  number2decimals = /^[0-9]+[.,]{1,1}[0-9]{2,2}$/;

  usuario = signal<UsuarioModel | null>(null);
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vjService: TicketsService,
    private EtiquetaService: EtiquetaService,
    private prioridadService: PrioridadService,
    private noti: NotificationService,
    private vjServiceUser: UsuarioService,
    private vjServiceCategoria: CategoriaService,
    private translate: TranslateService
  ) {
    const id = 2;
    if (!isNaN(id)) {
      this.obtenerUsuario(id);
    }
  }

  // Obtener usuario y actualizar la Signal
  obtenerUsuario(id: number) {
    this.vjServiceUser.getById(id).subscribe((data: UsuarioModel) => {
      console.log('usuario:' + data.nombre);
      this.usuario.set(data);
    });
  }
  /**
   * Ciclo de vida OnInit: inicializa el formulario, carga listas y verifica si es actualización
   */
  ngOnInit(): void {
    this.initForm();
    this.loadEtiquetas();
    this.loadPrioridades();

    // Suscripción al control de nombre de etiqueta
    const nombreCtrl = this.TicketForm.get('etiquetas.nombre');
    nombreCtrl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.filteredEtiquetas = this.etiquetasList();
        this.TicketForm.get('etiquetas.id_etiqueta')?.reset();
        this.categoriasEtiqueta = [];
      } else {
        this.applyEtiquetaFilter(value);
      }
    });

    // Suscripción a parámetros de ruta
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.idTicket = params['id'] ?? null;
      this.isCreate = this.idTicket === null;
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar';

      // 👇 Ajustar validadores según modo
      const etiquetaNombreCtrl = this.TicketForm.get('etiquetas.nombre');
      const etiquetaIdCtrl = this.TicketForm.get('etiquetas.id_etiqueta');

      if (this.isCreate) {
        etiquetaNombreCtrl?.setValidators([Validators.required]);
        etiquetaIdCtrl?.setValidators([Validators.required]);
      } else {
        etiquetaNombreCtrl?.clearValidators();
        etiquetaIdCtrl?.clearValidators();
      }
      etiquetaNombreCtrl?.updateValueAndValidity();
      etiquetaIdCtrl?.updateValueAndValidity();

      // Si hay id, cargar datos del ticket
      if (this.idTicket) {
        this.vjService
          .getById(this.idTicket)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            this.patchFormValues(data);

            // 👇 Buscar la categoría asociada con el id_categoria
            if (data.id_categoria) {
              this.vjServiceCategoria
                .getById(data.id_categoria)
                .pipe(takeUntil(this.destroy$))
                .subscribe((cat) => {
                  this.categoriasEtiqueta = [cat];
                });
            }
          });
      }
    });
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.TicketForm = this.fb.group({
      //id_ticket: [null],
      titulo: [null, [Validators.required, Validators.minLength(2)]],
      descripcion: [null, [Validators.required, minWordsValidator(3)]],
      prioridad: this.fb.group({
        id_prioridad: [null, Validators.required],
      }),
      observaciones: [null, [Validators.required, Validators.minLength(2)]],
      imagenes: [null, Validators.required],
      id_categoria: [null, Validators.required],
      //id_usuario_cliente: [null],
      etiquetas: this.fb.group({
        id_etiqueta: [null, Validators.required],
        nombre: [null, Validators.required],
      }),
      aceptacion: [],
    });
  }

  /**
   * Getter para acceder al FormArray de Historial
   */
  get Historial_Estados(): FormArray {
    return this.TicketForm.get('Historial_Estados') as FormArray;
  }

  /**
   * Carga las etiquetas desde el API y actualiza la signal
   */
  private loadEtiquetas() {
    this.EtiquetaService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.etiquetasList.set(data);
        this.filteredEtiquetas = data;
      });
  }

  /**
   * Carga las prioridades desde el API y actualiza la signal
   */
  private loadPrioridades() {
    this.prioridadService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => this.prioridadList.set(data));
  }

  /**
   * Carga los valores del formulario con los datos del ticket a actualizar
   * @param data Datos del ticket obtenidos del API
   */
  private patchFormValues(data: TicketsModel) {
    this.TicketForm.patchValue({
      id_ticket: data.id_ticket,
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_creacion: data.fecha_creacion,
      fecha_cierre: data.fecha_cierre,
      estado: data.estado,
      observaciones: data.Historial_Estados?.[0]?.observaciones ?? '',
      id_categoria: data.id_categoria,
      prioridad: {
        id_prioridad: data.prioridad,
      },
      imagenes: [],
    });
  }

  /**
   * Envía el formulario: valida, carga la imagen y guarda/actualiza el videojuego
   */
  submitTicket() {
    this.TicketForm.markAllAsTouched();
    if (this.TicketForm.invalid) {
      this.noti.error(
        this.translate.instant('TICKET.ERROR_FORM_TITLE'),
        this.translate.instant('TICKET.ERROR_FORM_MESSAGE'),
        5000
      );
      return;
    }

    const formValue = this.TicketForm.value;
    const imagenes: ImagesModel[] = this.imageFileNames.map((fileName: string, index: number) => ({
      ruta_imagen: fileName,
    }));

    const payloadHistorial: HistorialEstadoModel[] = [
      {
        id: 0,
        id_historial: 0,
        estado_anterior: '',
        nuevo_estado: 'Pendiente',
        observaciones: formValue.observaciones,
        fecha_cambio: new Date(),
        id_ticket: formValue.id_ticket,
        id_usuario: this.usuario()?.id_usuario ?? 0,
        Imagenes_Ticket: imagenes,
      },
    ];

    const payloadTickets: TicketsModel = {
      id: formValue.id_ticket,
      id_ticket: formValue.id_ticket,
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      fecha_creacion: new Date(),
      fecha_cierre: null,
      estado: 'Pendiente',
      prioridad: formValue.prioridad.id_prioridad,
      id_categoria: formValue.id_categoria,
      id_usuario_cliente: this.usuario()?.id_usuario ?? 0,
      Historial_Estados: payloadHistorial,
      aceptacion: formValue.aceptacion, // 👈 aquí lo envías
    };

    console.log('Payload enviado al backend:', payloadTickets);

    const request$ = this.isCreate
      ? this.vjService.create(payloadTickets)
      : this.vjService.update(payloadTickets);

    request$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.noti.success(
        this.isCreate
          ? this.translate.instant('TICKET.CREATE_TITLE')
          : this.translate.instant('TICKET.UPDATE_TITLE'),
        this.isCreate
          ? this.translate.instant('TICKET.CREATE_MESSAGE', { title: data.titulo })
          : this.translate.instant('TICKET.UPDATE_MESSAGE', { title: data.titulo }),
        3000,
        '/tickets-admin'
      );
    });
  }

  /**
   * Resetea el formulario a valores iniciales
   */
  onReset() {
    this.TicketForm.reset();
    this.preview = '';
    this.currentFile = undefined;
    this.nameImage = 'image-not-found.jpg';
    //this.plataformas.clear();
    //this.addPlataforma();
  }

  /**
   * Navega de regreso a la lista de videojuegos
   */
  onBack() {
    this.router.navigate(['/tickets-admin']);
  }

  /**
   * Ciclo de vida OnDestroy: limpia suscripciones
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEtiquetaSelected(event: any) {
    const nombre = event.option.value as string;
    const etiqueta = this.etiquetasList().find((e) => e.nombre === nombre);

    if (etiqueta) {
      // Actualiza el FormGroup con la etiqueta seleccionada
      this.TicketForm.get('etiquetas.id_etiqueta')?.setValue(etiqueta.id_etiqueta);
      this.TicketForm.get('etiquetas.nombre')?.setValue(etiqueta.nombre);

      // Llamada al backend que ya trae las categorías
      this.EtiquetaService.getById(etiqueta.id_etiqueta)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.categoriasEtiqueta = data.categorias ?? [];

          // Si hay categorías, asigna el id de la primera al form
          if (this.categoriasEtiqueta.length > 0) {
            const primeraCategoria = this.categoriasEtiqueta[0];
            this.TicketForm.get('id_categoria')?.setValue(primeraCategoria.id_categoria);
          }
        });
    } else {
      this.categoriasEtiqueta = []; // limpiar si no hay selección
      this.TicketForm.get('id_categoria')?.reset();
    }
  }

  applyEtiquetaFilter(value: string | null) {
    const q = (value ?? '').trim().toLowerCase();
    const list = this.etiquetasList();
    this.filteredEtiquetas = q ? list.filter((e) => e.nombre.toLowerCase().includes(q)) : list;
  }

  selectFiles(event: any): void {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedImages.push({ file, preview: e.target.result });
        this.imageFileNames.push(file.name);
        //Se actualiza el array
        this.TicketForm.get('imagenes')?.setValue(this.selectedImages);
        this.TicketForm.get('imagenes')?.updateValueAndValidity();
      };

      reader.readAsDataURL(file);
    }

    // Limpia el input para permitir volver a seleccionar el mismo archivo
    event.target.value = '';
  }

  removeImage(img: any): void {
    this.selectedImages = this.selectedImages.filter((i) => i !== img);
    this.TicketForm.get('imagenes')?.setValue(
      this.selectedImages.length > 0 ? this.selectedImages : null
    );
    this.TicketForm.get('imagenes')?.updateValueAndValidity();
  }

  setAceptacion(valor: 'Si' | 'No'): void {
    this.TicketForm.patchValue({ aceptacion: valor });
  }
}
