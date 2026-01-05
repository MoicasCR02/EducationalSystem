import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../share/services/app/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TicketsModel } from '../../share/models/TicketsModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-usuario-login',
  standalone: false,
  templateUrl: './usuario-login.html',
  styleUrl: './usuario-login.css',
})
export class UsuarioLogin {
  hide = true;
  formulario!: FormGroup;
  makeSubmit: boolean = false;
  infoUsuario: any;
  constructor(
    public fb: FormBuilder,
    private noti: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private translate: TranslateService
  ) {
    this.reactiveForm();
  }
  // Definir el formulario con su reglas de validación
  reactiveForm() {
    this.formulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }
  ngOnInit(): void {}

  onReset() {
    this.formulario.reset();
  }
  submitForm() {
    this.makeSubmit = true;
    // Validación
    if (this.formulario.invalid) {
      this.noti.error(
        this.translate.instant('ASSIGN.ERROR_FORM_TITLE'),
        this.translate.instant('ASSIGN.ERROR_FORM_MESSAGE'),
        5000
      );
      return;
    }

    // Obtener las credenciales del formulario
    const credentials = this.formulario.value;
    console.log('datos', JSON.stringify(credentials, null, 2));

    // Llama al método loginUser del AuthenticationService
    this.authService.loginUser(credentials).subscribe({
      next: (response) => {
        console.log('Login', response);
        // La autenticación fue exitosa.
        // El AuthenticationService ya guarda el token y obtiene el perfil.
        this.noti.success(
          this.translate.instant('LOGIN.SUCCESS_TITLE'),
          this.translate.instant('LOGIN.SUCCESS_MESSAGE'),
          3000,
          '/inicio'
        );
      },
      error: (error) => {
        // Manejo de errores de autenticación
        console.error('Error de inicio de sesión:', error);
        let errorMessageKey = 'LOGIN.ERROR_GENERIC'; // mensaje por defecto
        if (error.status === 401) {
          errorMessageKey = 'LOGIN.ERROR_CREDENTIALS';
        } else if (error.error && error.error.message) {
          // si el backend devuelve un mensaje específico, lo usamos directamente
          errorMessageKey = error.error.message;
        }

        this.noti.error(
          this.translate.instant('LOGIN.ERROR_TITLE'),
          this.translate.instant(errorMessageKey),
          3000
        );
      },
    });
  }
}
