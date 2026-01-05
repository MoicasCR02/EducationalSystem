// auth.guard.ts
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/app/authentication.service';
import { NotificationService } from '../services/app/notification.service';
import { catchError, map, of, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  const noti = inject(NotificationService);
  const translate = inject(TranslateService);

  // Verifica token
  if (!authService.authenticated()) {
    noti.warning(
      translate.instant('AUTH.ERROR_TITLE'),
      translate.instant('AUTH.ERROR_LOGIN_REQUIRED'),
      3000
    );
    return router.createUrlTree(['/usuario/login']);
  }

  // Espera a que el perfil esté cargado
  return authService.getUserProfile().pipe(
    tap(user => {
      if (!user) {
        noti.warning(
          translate.instant('AUTH.ERROR_TITLE'),
          translate.instant('AUTH.ERROR_INVALID_SESSION'),
          3000
        );
        authService.logout();
      }
    }),
    map(user => {
      if (!user) return router.createUrlTree(['/usuario/login']);

      const userRole =
        typeof user.id_rol === 'string'
          ? user.id_rol
          : user.id_rol;

      const rolesAllowed: string[] = route.data['roles'] ?? [];

      if (rolesAllowed.length > 0 && !rolesAllowed.includes(userRole)) {
        noti.warning(
          translate.instant('AUTH.RESTRICTED_TITLE'),
          translate.instant('AUTH.RESTRICTED_MESSAGE'),
          3000
        );
        return router.createUrlTree(['/inicio']);
      }

      return true;
    }),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/usuario/login']));
    })
  );
};
