import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si hay sesión activa y si el rol es 'admin'
  const esAdmin = authService.isLoggedIn() && authService.getTipoUsuario() === 'admin';

  if (esAdmin) {
    return true; // Permite el acceso a la ruta
  }

  // 2. Si no es admin, redirigimos al login o inicio
  return router.createUrlTree(['/sesion']);
};