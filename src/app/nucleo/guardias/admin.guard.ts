import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  const usuario = authService.obtenerUsuario();
  
  // ✅ CAMBIO: Permitir administrador Y vendedor
  if (usuario && (usuario.rol === 'administrador' || usuario.rol === 'vendedor')) {
    return true;
  }

  // Si no es admin o vendedor, redirigir al login
  router.navigate(['/autenticacion/iniciar-sesion']);
  return false;
};