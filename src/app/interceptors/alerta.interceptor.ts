import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AlertaService } from '../services/alerta.service';
import { tap } from 'rxjs';

export const alertaInterceptor: HttpInterceptorFn = (req, next) => {
  const alertaService = inject(AlertaService);

  // Nos aseguramos de filtrar métodos que modifican datos
  const esModificacion = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

  return next(req).pipe(
    tap(event => {
      if (esModificacion && event instanceof HttpResponse) {
        // Intentamos rescatar mensaje del body si existe
        const cuerpo = event.body as any;
        const mensajeBackend = cuerpo?.mensaje || cuerpo?.message;

        // Si hay mensaje lo usamos, sino mostramos un aviso de éxito genérico pero seguro
        const textoFinal = mensajeBackend ? mensajeBackend : '¡Operación realizada con éxito!';
        
        alertaService.mostrar(textoFinal);
      }
    })
  );
};