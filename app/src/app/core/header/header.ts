import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { CartService } from '../../share/services/app/cart.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private router = inject(Router);
  private authService = inject(AuthenticationService);
  private cartService = inject(CartService);


   /** Signals de usuario logueado */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;
  readonly qtyItems = this.cartService.qtyItems;

   /** Control de roles */
readonly role = computed(() => {
  const user = this.currentUser();
  return typeof user?.id_rol === 'string'
    ? user.id_rol                 // ej. "ADMIN"
    : user?.id_rol ?? null;
});
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isUser = computed(() => this.role() === 'USER');
  readonly isTecnico = computed(() => this.role() === 'TECNICO');

   /** Extraer correo del usuario logueado */
  readonly correo = computed(() => {
    const user = this.currentUser();
    return user?.correo ?? ''; // devuelve string vacío si no hay usuario
  });

  /** Navegación */
  login = () => this.router.navigate(['/login']);
  logout = () => this.authService.logout();

}
