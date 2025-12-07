import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const autenticacionInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AutenticacionService);
  let token = authService.obtenerToken();

  if (token) {
    // ✅ Quitar comillas dobles si existen
    token = token.replace(/^"|"$/g, '');
    
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};