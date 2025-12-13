import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Producto, FiltrosProducto, PaginacionProductos, ProductoFormulario } from '../modelos/producto.model';
import { mapearProductoBackend } from '../../../../compartido/modelos/producto.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener productos para PANEL ADMIN (incluye inactivos)
   */
  obtenerProductos(filtros: FiltrosProducto = {}, pagina: number = 1): Observable<PaginacionProductos> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', '15');

    if (filtros.busqueda) {
      params = params.set('buscar', filtros.busqueda);
    }

    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }

    if (filtros.tipo_lana) {
      params = params.set('tipo', filtros.tipo_lana);
    }

    if (filtros.color) {
      params = params.set('color', filtros.color);
    }

    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    // ⭐ USAR RUTA ADMIN para panel de administración
    return this.http.get<any>(`${this.apiUrl}/admin`, { params })
      .pipe(
        map(response => {
          console.log('✅ Respuesta productos admin:', response);
          
          if (response.success) {
            const paginacion = response.data;
            let productosData: any[] = [];

            // Manejar paginación Laravel
            if (paginacion && typeof paginacion === 'object' && 'data' in paginacion) {
              productosData = paginacion.data;
            } else if (Array.isArray(paginacion)) {
              productosData = paginacion;
            }

            const productosMapeados = productosData.map(p => mapearProductoBackend(p));

            return {
              data: productosMapeados,
              current_page: paginacion.current_page || 1,
              last_page: paginacion.last_page || 1,
              per_page: paginacion.per_page || 15,
              total: paginacion.total || productosMapeados.length
            };
          }

          
          return {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0
          };
        })
      );
  }

  /**
   * ✅ CREAR PRODUCTO - AHORA ACEPTA JSON O FORMDATA
   */
  crearProducto(data: any): Observable<Producto> {
    // Si recibe FormData, NO hacer nada (mantener compatibilidad)
    // Si recibe objeto, enviar como JSON
    const isFormData = data instanceof FormData;
    
    const headers = isFormData ? {} : new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('📦 Creando producto:', isFormData ? 'FormData' : 'JSON', data);

    return this.http.post<any>(this.apiUrl, data, { headers }).pipe(
      map((response: any) => {
        console.log('✅ Producto creado:', response);
        return mapearProductoBackend(response.data || response);
      })
    );
  }

  /**
   * ✅ ACTUALIZAR PRODUCTO - AHORA ACEPTA JSON O FORMDATA
   */
  actualizarProducto(id: number, data: any): Observable<Producto> {
    const isFormData = data instanceof FormData;
    
    if (isFormData) {
      // Si es FormData, usar el método POST con _method=PUT (Laravel)
      data.append('_method', 'PUT');
      return this.http.post<any>(`${this.apiUrl}/${id}`, data).pipe(
        map((response: any) => {
          console.log('✅ Producto actualizado:', response);
          return mapearProductoBackend(response.data || response);
        })
      );
    } else {
      // Si es JSON, usar PUT directamente
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('📦 Actualizando producto con JSON:', data);

      return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers }).pipe(
        map((response: any) => {
          console.log('✅ Producto actualizado:', response);
          return mapearProductoBackend(response.data || response);
        })
      );
    }
  }

  /**
   * Desactivar producto (no elimina físicamente)
   */
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener producto por ID
   */
  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => mapearProductoBackend(response.data || response))
    );
  }
}