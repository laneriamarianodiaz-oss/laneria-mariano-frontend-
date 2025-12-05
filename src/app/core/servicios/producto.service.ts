import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Producto, FiltrosProducto, PaginacionProductos } from '../../modulos/administrador/productos/modelos/producto.model';
import { mapearProductoBackend } from '../../compartido/modelos/producto.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  obtenerProductos(filtros?: FiltrosProducto | any, pagina: number = 1): Observable<PaginacionProductos> {
    let params = new HttpParams().set('page', pagina.toString());
    
    if (filtros) {
      if (filtros.busqueda) params = params.set('buscar', filtros.busqueda);
      if (filtros.buscar) params = params.set('buscar', filtros.buscar);
      if (filtros.tipo_lana) params = params.set('tipo', filtros.tipo_lana);
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.color) params = params.set('color', filtros.color);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.stock_bajo) params = params.set('stock_bajo', 'true');
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        let productos: any[] = [];
        
        if (response.data && Array.isArray(response.data.data)) {
          productos = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          productos = response.data;
        } else if (Array.isArray(response)) {
          productos = response;
        }

        const productosMapeados = productos.map(p => mapearProductoBackend(p));

        return {
          data: productosMapeados,
          current_page: response.data?.current_page || 1,
          last_page: response.data?.last_page || 1,
          per_page: response.data?.per_page || productosMapeados.length,
          total: response.data?.total || productosMapeados.length
        };
      })
    );
  }

  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => mapearProductoBackend(response.data))
    );
  }

  obtenerTipos(): Observable<string[]> {
    return this.http.get<any>(`${environment.apiUrl}/productos-tipos`).pipe(
      map(response => response.data || [])
    );
  }

  obtenerColores(): Observable<string[]> {
    return this.http.get<any>(`${environment.apiUrl}/productos-colores`).pipe(
      map(response => response.data || [])
    );
  }

  crearProducto(producto: FormData): Observable<Producto> {
    return this.http.post<any>(this.apiUrl, producto).pipe(
      map(response => mapearProductoBackend(response.data))
    );
  }

  actualizarProducto(id: number, producto: FormData): Observable<Producto> {
    producto.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/${id}`, producto).pipe(
      map(response => mapearProductoBackend(response.data))
    );
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}