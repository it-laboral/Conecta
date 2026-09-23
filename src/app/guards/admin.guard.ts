import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Si no hay sesión activa -> Redirigir a /sesion
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/sesion']);
  }

  // 2. Si hay sesión y es Admin -> Permitir acceso
  if (authService.getTipoUsuario() === 'admin') {
    return true;
  }

  // 3. Si hay sesión pero no es Admin -> Redirigir según el rol
  const rol = authService.getTipoUsuario();
  if (rol === 'empresa') {
    return router.createUrlTree(['/empresa/mis-candidatos']);
  }

  return router.createUrlTree(['/mis-postulaciones']);
};