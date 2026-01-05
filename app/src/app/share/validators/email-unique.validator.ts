import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { UsuarioService } from '../services/api/usuario.service'; // 👈 ajusta la ruta a tu servicio
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export function emailUniqueValidator(usuarioService: UsuarioService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const correo = control.value;

    if (!correo) {
      return of(null); // si está vacío, no valida
    }

    return usuarioService.getByCorreo(correo).pipe(
      map(usuario => {
        return usuario ? { emailTaken: true } : null; // 👈 si existe, error
      }),
      catchError(() => of(null)) // en caso de error, no bloquear el form
    );
  };
}
