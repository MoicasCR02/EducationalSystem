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
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import { emailUniqueValidator } from '../../share/validators/email-unique.validator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-usuario-formcrear',
  standalone: false,
  templateUrl: './usuario-formcrear.html',
  styleUrl: './usuario-formcrear.css',
})
export class UsuarioFormcrear {
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

  hidePassword = true;
  passwordsMatchValidator = passwordsMatchValidator;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vjService: UsuarioService,
    private noti: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.idUsuario = params['id'] ?? null;
      this.isCreate = this.idUsuario === null;
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar';

      this.setCorreoValidators();
      this.adjustPasswordValidators();

      const rolControl = this.TecnicosForm.get('id_rol');
      if (rolControl) {
        if (!this.isCreate) {
          rolControl.disable();
        } else {
          rolControl.enable();
        }
      }

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
      contrasena: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
        ],
      ],
      confirmarContrasena: [null], // 👈 sin validadores aquí
      activo: [null, Validators.required],
      id_rol: [null, Validators.required],
    });
  }

  // 👉 Método para aplicar validadores dinámicamente
  private setCorreoValidators(): void {
    const correoControl = this.TecnicosForm.get('correo');
    if (!correoControl) return;

    if (this.isCreate) {
      correoControl.setAsyncValidators([emailUniqueValidator(this.vjService)]);
    } else {
      correoControl.clearAsyncValidators(); // 👈 elimina validación de correo único en update
    }
    correoControl.updateValueAndValidity();
  }

  private adjustPasswordValidators(): void {
    const confirmarControl = this.TecnicosForm.get('confirmarContrasena');
    if (!confirmarControl) return;

    if (this.isCreate) {
      confirmarControl.setValidators(Validators.required);
      this.TecnicosForm.setValidators(this.passwordsMatchValidator);
    } else {
      confirmarControl.clearValidators();
      this.TecnicosForm.setValidators(null);
    }

    confirmarControl.updateValueAndValidity();
    this.TecnicosForm.updateValueAndValidity();
  }

  private patchFormValues(data: UsuarioModel) {
    this.TecnicosForm.patchValue({
      id_usuario: data.id_usuario,
      nombre: data.nombre,
      contrasena: data.contrasena,
      correo: data.correo,
      activo: data.activo ? 1 : 0,
      carga_actual: data.carga_actual,
      id_rol: data.id_rol,
    });
  }

  submitUsuario() {
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
      contrasena: formValue.contrasena,
      activo: formValue.activo,
      carga_actual: formValue.carga_actual,
      especialidades: payloadEspecialidades,
      id_rol: formValue.id_rol,
    };

    console.log('📦 Payload enviado al backend:', payload);

    const request$ = this.isCreate
      ? this.vjService.createUsuario(payload)
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
        '/usuario-crear'
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
