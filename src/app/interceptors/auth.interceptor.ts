import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  let token: string | null = null;

if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');

    if (!token) {
      const usuarioSesion = localStorage.getItem('usuario');
      if (usuarioSesion) {
        try {
          const userObj = JSON.parse(usuarioSesion);
          token = userObj.token || null;
        } catch (e) {
          console.error('Error parseando usuario en el interceptor', e);
        }
      }
    }
  }

  // Clona la petición agregando el Header si existe un token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Intercepta la respuesta del backend
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = No autorizado (Token vencido o inválido)
      // 403 = Prohibido (Sin permisos suficientes)
      if (error.status === 401 || error.status === 403) {
        if (isPlatformBrowser(platformId)) {
          // Limpiamos los datos de sesión caducados
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
        
        // Redirigimos de inmediato a la pantalla de login
        router.navigate(['/login']);
      }

      // Propaga el error para que los servicios/componentes puedan reaccionar si lo necesitan
      return throwError(() => error);
    })
  );
};