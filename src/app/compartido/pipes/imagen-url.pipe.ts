import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'imagenUrl',
  standalone: true
})
export class ImagenUrlPipe implements PipeTransform {
  
  transform(imagenUrl: string | null | undefined): string {
    // Si no hay imagen, retornar placeholder
    if (!imagenUrl || imagenUrl.trim() === '') {
      return environment.imagenPlaceholder || '/assets/imagenes/placeholder.png';
    }

    // Si ya es una URL completa (http o https), retornarla tal cual
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl;
    }

    // Extraer URL base del apiUrl
    const apiUrl = environment.apiUrl || 'laneria-mariano-backend-production.up.railway.app/api/v1';
    const baseUrl = apiUrl.replace('/api/v1', '').replace('/api', '');
    
    // Si la URL ya tiene /productos/, usarla tal cual
    // Si no, agregarla
    let rutaCompleta = imagenUrl;
    if (!imagenUrl.startsWith('/productos/') && !imagenUrl.includes('/productos/')) {
      rutaCompleta = `/productos/${imagenUrl}`;
    }
    
    // Limpiar barras duplicadas
    if (!rutaCompleta.startsWith('/')) {
      rutaCompleta = `/${rutaCompleta}`;
    }
    
    return `${baseUrl}${rutaCompleta}`;
  }
}