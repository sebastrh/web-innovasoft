import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login guardando la URL intentada
  return router.createUrlTree(['/gestion-interna'], {
    queryParams: { returnUrl: state?.url || '', unauthorized: 'true' }
  });
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/gestion-interna']);
  }

  if (authService.isAdmin()) {
    return true;
  }

  // Si no es admin pero está logueado, redirigir al login con aviso
  return router.createUrlTree(['/gestion-interna'], {
    queryParams: { forbidden: 'true' }
  });
};
