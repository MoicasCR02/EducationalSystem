import { AbstractControl, ValidationErrors } from "@angular/forms";

export function correoCentroEduValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const regex = /^[a-zA-Z0-9._%+-]+@centroedu\.com$/;
  return regex.test(value) ? null : { correoCentroEdu: true };
}