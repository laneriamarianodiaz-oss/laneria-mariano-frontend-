import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const autenticacionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AutenticacionService);
  const token = authService.obtenerToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};