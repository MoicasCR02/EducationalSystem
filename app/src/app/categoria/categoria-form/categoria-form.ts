import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { EtiquetaService } from '../../share/services/api/etiqueta.service';
import { SlaService } from '../../share/services/api/sla.service';
import { FileUploadService } from '../../share/services/api/file-upload.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { minWordsValidator } from '../../share/validators/min-words-validator';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { SlaModel } from '../../share/models/SlaModel';
import { EtiquetaModel } from '../../share/models/EtiquetasModel';
import { EspecialidadService } from '../../share/services/api/especialidad.sevice';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-categoria-form',
  standalone: false,
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  titleForm = '';
  idCategoria: number | null = null;
  isCreate = true;

  etiquetasList = signal<EtiquetaModel[]>([]);
  slaList = signal<SlaModel[]>([]);
  especialidadList = signal<EspecialidadModel[]>([]);

  categoriaForm!: FormGroup;

  currentFile?: File;
  preview = '';
  nameImage = 'image-not-found.jpg';
  previousImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vjService: CategoriaService,
    private etiquetasService: EtiquetaService,
    private slaService: SlaService,
    private especialidadService: EspecialidadService,
    private uploadService: FileUploadService,
    private noti: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEtiquetas();
    this.loadEspecialidades();
    this.loadSla();

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.idCategoria = params['id'] ?? null;
      this.isCreate = this.idCategoria === null;
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar';

      if (this.idCategoria) {
        this.vjService
          .getById(this.idCategoria)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => this.patchFormValues(data));
      }
    });
  }

  private initForm(): void {
    this.categoriaForm = this.fb.group({
      id_categoria: [null],
      nombre: [null, [Validators.required, Validators.minLength(2)]],
      descripcion: [null, [Validators.required, minWordsValidator(3)]],
      etiquetas: [null, Validators.required],
      especialidades: [null, Validators.required],
      sla: this.fb.group({
        id_sla: [null, Validators.required],
        nombre: [null],
        tiempo_max_respuesta: [null],
        tiempo_max_resolucion: [null],
      }),
    });
  }

  private loadEtiquetas() {
    this.etiquetasService.get().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.etiquetasList.set(data);
    });
  }

  private loadEspecialidades() {
    this.especialidadService.get().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.especialidadList.set(data);
    });
  }

  private loadSla() {
    this.slaService.get().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.slaList.set(data);
    });
  }

  private patchFormValues(data: CategoriaModel) {
    this.categoriaForm.patchValue({
      id_categoria: data.id_categoria,
      nombre: data.nombre,
      descripcion: data.descripcion,
      etiquetas: data.etiquetas.map((g) => g.id_etiqueta),
      especialidades: data.especialidades.map((g) => g.id_especialidad),
      sla: {
        id_sla: data.sla?.id_sla,
        nombre: data.sla?.nombre,
        tiempo_max_respuesta: data.sla?.tiempo_max_respuesta,
        tiempo_max_resolucion: data.sla?.tiempo_max_resolucion,
      },
    });
  }

submitCategoria() {
  this.categoriaForm.markAllAsTouched();

  if (this.categoriaForm.invalid) {
    this.noti.error(
      this.translate.instant('CATEGORY.NOTI_ERROR_TITLE'),
      this.translate.instant('CATEGORY.NOTI_ERROR_MESSAGE'),
      5000
    );
    return;
  }

  const formValue = this.categoriaForm.value;

  const payloadEtiquetas = formValue.etiquetas?.map((id: number) => ({ id_etiqueta: id })) ?? [];
  const payloadEspecialidades = formValue.especialidades?.map((id: number) => ({ id_especialidad: id })) ?? [];

  const payload: CategoriaModel = {
    id: formValue.id_categoria,
    id_categoria: formValue.id_categoria,
    nombre: formValue.nombre,
    descripcion: formValue.descripcion,
    sla: { id_sla: formValue.sla.id_sla } as SlaModel,
    etiquetas: payloadEtiquetas,
    especialidades: payloadEspecialidades
  };

  console.log("📦 Payload enviado al backend:", payload);

  const request$ = this.isCreate
    ? this.vjService.create(payload)
    : this.vjService.update(payload);

  request$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
    this.noti.success(
      this.isCreate
        ? this.translate.instant('CATEGORY.NOTI_CREATE_TITLE')
        : this.translate.instant('CATEGORY.NOTI_UPDATE_TITLE'),
      this.isCreate
        ? this.translate.instant('CATEGORY.NOTI_CREATE_MESSAGE', { name: data.nombre })
        : this.translate.instant('CATEGORY.NOTI_UPDATE_MESSAGE', { name: data.nombre }),
      900,
      '/categoria-admin'
    );
  });
}

  onReset() {
    this.categoriaForm.reset();
    this.preview = '';
    this.currentFile = undefined;
    this.categoriaForm.get('sla')?.reset({
      id_sla: null,
      nombre: null,
      tiempo_max_respuesta: null,
      tiempo_max_resolucion: null,
    });
  }

  onBack() {
    this.router.navigate(['/categoria-admin']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
