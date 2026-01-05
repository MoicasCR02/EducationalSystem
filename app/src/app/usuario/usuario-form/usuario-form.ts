import { Component, signal } from '@angular/core';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { EspecialidadService } from '../../share/services/api/especialidad.sevice';
import { FileUploadService } from '../../share/services/api/file-upload.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { minWordsValidator } from '../../share/validators/min-words-validator';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { correoCentroEduValidator } from '../../share/validators/correo-validator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-usuario-form',
  standalone: false,
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  private destroy$ = new Subject<void>();

  titleForm = 'Crear';
  idUsuario: number | null = null;
  isCreate = true;

  especialidadList = signal<EspecialidadModel[]>([]);

  TecnicosForm!: FormGroup;

  currentFile?: File;
  preview = '';
  nameImage = 'image-not-found.jpg';
  previousImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vjService: UsuarioService,
    private especialidadService: EspecialidadService,
    private noti: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEspecialidades();

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.idUsuario = params['id'] ?? null;
      this.isCreate = this.idUsuario === null;
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar';

      if (this.idUsuario) {
        this.vjService
          .getById(this.idUsuario)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => this.patchFormValues(data));
      }
    });
  }

  private initForm(): void {
    this.TecnicosForm = this.fb.group({
      id_usuario: [null],
      nombre: [null, [Validators.required, Validators.minLength(2)]],
      correo: [null, [Validators.required, correoCentroEduValidator]],
      activo: [null, Validators.required],
      especialidades: [null, Validators.required],
    });
  }

  private loadEspecialidades() {
    this.especialidadService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.especialidadList.set(data);
      });
  }

  private patchFormValues(data: UsuarioModel) {
    this.TecnicosForm.patchValue({
      id_usuario: data.id_usuario,
      nombre: data.nombre,
      correo: data.correo,
      activo: data.activo ? 1 : 0,
      carga_actual: data.carga_actual,
      especialidades: data.especialidades?.map((g) => g.id_especialidad),
    });
  }

  submitTecnico() {
    this.TecnicosForm.markAllAsTouched();

    if (this.TecnicosForm.invalid) {
      this.noti.error(
        this.translate.instant('ASSIGN.ERROR_FORM_TITLE'),
        this.translate.instant('ASSIGN.ERROR_FORM_MESSAGE'),
        5000
      );
      return;
    }

    const formValue = this.TecnicosForm.value;
    const payloadEspecialidades =
      formValue.especialidades?.map((id: number) => ({ id_especialidad: id })) ?? [];

    const payload: UsuarioModel = {
      id: formValue.id_usuario,
      id_usuario: formValue.id_usuario,
      nombre: formValue.nombre,
      correo: formValue.correo,
      contrasena: '123456',
      activo: formValue.activo, // revisar despues
      carga_actual: formValue.carga_actual,
      especialidades: payloadEspecialidades,
      id_rol: 'TECNICO',
    };

    console.log('📦 Payload enviado al backend:', payload);

    const request$ = this.isCreate
      ? this.vjService.create(payload)
      : this.vjService.update(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.noti.success(
        this.isCreate
          ? this.translate.instant('TECHNICIAN.CREATE_TITLE')
          : this.translate.instant('TECHNICIAN.UPDATE_TITLE'),
        this.isCreate
          ? this.translate.instant('TECHNICIAN.CREATE_MESSAGE', { name: data.nombre })
          : this.translate.instant('TECHNICIAN.UPDATE_MESSAGE', { name: data.nombre }),
        900,
        '/usuario-admin'
      );
    });
  }

  onReset() {
    this.TecnicosForm.reset();
    this.preview = '';
    this.currentFile = undefined;
  }

  onBack() {
    this.router.navigate(['/usuario-admin']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
