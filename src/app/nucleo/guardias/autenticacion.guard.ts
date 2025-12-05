import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const autenticacionGuard = () => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  router.navigate(['/autenticacion/inicio-sesion']);
  return false;
};