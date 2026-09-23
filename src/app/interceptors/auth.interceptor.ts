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
    const rawToken = localStorage.getItem('token');

    if (rawToken) {
      token = rawToken;
    } else {
      const usuarioSesion = localStorage.getItem('usuario');
      if (usuarioSesion) {
        try {
          const userObj = JSON.parse(usuarioSesion);
          token = userObj.token || userObj.jwt || null;
        } catch (e) {
          console.error('Error parseando usuario en el interceptor:', e);
        }
      }
    }

    // 🧹 Limpieza defensiva: Elimina comillas extra si el token se guardó con JSON.stringify
    if (token) {
      token = token.replace(/^"|"$/g, '').trim();
    }
  }

  // Clona la petición inyectando el header Authorization si existe token
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isPlatformBrowser(platformId)) {
        // 🚨 401: Sesión expirada o token no válido
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');

          if (router.url !== '/sesion') {
            router.navigate(['/sesion']);
          }
        } 
        // 🔒 403: Autenticado pero sin los permisos suficientes
        else if (error.status === 403) {
          console.warn('Acceso denegado (403): No cuentas con el rol necesario para esta acción.');
        }
      }

      return throwError(() => error);
    })
  );
};