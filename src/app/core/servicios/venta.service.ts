import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { entorno } from '../../../entornos/entorno';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  
  private urlApi = `${entorno.urlApi}`;

  constructor(private http: HttpClient) { }

  /**
   * ⭐ CREAR VENTA DESDE CARRITO CON COMPROBANTE
   */
  crearVentaDesdeCarrito(
    metodoPago: string, 
    observaciones?: string, 
    datosAdicionales?: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // ⭐ COMBINAR TODOS LOS DATOS
    const body = {
      metodo_pago: metodoPago,
      observaciones: observaciones || null,
      ...datosAdicionales  // ⭐ Incluye comprobante_pago y codigo_operacion
    };

    console.log('📤 Enviando datos al checkout:', body);

    return this.http.post<any>(
      `${this.urlApi}/carrito/checkout`, 
      body, 
      { headers }
    );
  }

  /**
   * Crear venta manual (ADMIN)
   */
  crearVenta(datos: any): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/ventas/crear`, datos);
  }

  /**
   * Listar ventas
   */
  listarVentas(filtros?: any): Observable<any> {
    return this.http.get<any>(`${this.urlApi}/ventas`, { params: filtros });
  }

  /**
   * Obtener venta por ID
   */
  obtenerVenta(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlApi}/ventas/${id}`);
  }

  /**
   * Actualizar estado de venta
   */
  actualizarEstado(id: number, estado: string, observaciones?: string): Observable<any> {
    const body: any = { estado };
    if (observaciones) {
      body.observaciones = observaciones;
    }
    return this.http.put<any>(`${this.urlApi}/ventas/${id}/estado`, body);
  }
}