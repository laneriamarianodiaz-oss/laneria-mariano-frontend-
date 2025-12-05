import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { entorno } from '../../../entornos/entorno';

export interface DetalleVenta {
  producto_id: number;
  cantidad: number;
}

export interface CrearVentaRequest {
  cliente_id: number;
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Yape' | 'Plin';
  observaciones?: string;
  detalles: DetalleVenta[];
}

export interface Venta {
  venta_id: number;
  cliente_id: number;
  fecha_venta: string;
  estado_venta: string;
  total_venta: number;
  metodo_pago: string;
  observaciones?: string;
  detalles?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private urlApi = entorno.urlApi;

  constructor(private http: HttpClient) {}

  /**
   * Crear venta desde el carrito
   */
  crearVenta(datos: CrearVentaRequest): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/ventas`, datos);
  }

  /**
   * Crear venta desde el carrito del usuario autenticado
   */
crearVentaDesdeCarrito(metodo_pago: string, observaciones?: string, datosExtra?: any): Observable<any> {
  const datos = {
    metodo_pago,
    observaciones,
    ...datosExtra
  };
  
  return this.http.post<any>(`${this.urlApi}/carrito/checkout`, datos);
}

  /**
   * Obtener mis pedidos (ventas del cliente)
   */
  obtenerMisPedidos(): Observable<any> {
    return this.http.get<any>(`${this.urlApi}/ventas/mis-pedidos`);
  }

  /**
   * Obtener detalle de una venta
   */
  obtenerVenta(ventaId: number): Observable<any> {
    return this.http.get<any>(`${this.urlApi}/ventas/${ventaId}`);
  }
}