import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('contrasena');
  const confirmPassword = group.get('confirmarContrasena');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordsMismatch: true });
    return { passwordsMismatch: true };
  } else {
    // Limpia el error si ya coincide
    confirmPassword?.setErrors(null);
    return null;
  }
}
