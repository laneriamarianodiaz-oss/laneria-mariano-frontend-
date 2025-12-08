import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { entorno } from '../../../../entornos/entorno';

export interface FiltrosPedidos {
  estado?: string;
  buscar?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente_id?: number;
  per_page?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  
  private urlApi = `${entorno.urlApi}`;
  private misPedidosUrl = `${entorno.urlApi}/mis-pedidos`;
  private adminPedidosUrl = `${entorno.urlApi}/admin/pedidos`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener mis pedidos (CLIENTE)
   */
  obtenerMisPedidos(estado?: string): Observable<any> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<any>(this.misPedidosUrl, { params });
  }

  /**
   * Obtener detalle de un pedido
   */
  obtenerPedido(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlApi}/pedidos/${id}`);
  }

  /**
   * Cancelar pedido (CLIENTE)
   */
  cancelarPedido(id: number, motivo?: string): Observable<any> {
    const body = motivo ? { motivo } : {};
    return this.http.post<any>(`${this.urlApi}/pedidos/${id}/cancelar`, body);
  }

  /**
   * ⭐ NUEVO: Guardar URL del comprobante (RECIBE JSON CON URL DE CLOUDINARY)
   */
  guardarComprobanteURL(id: number, datos: { comprobante_pago: string, codigo_operacion: string | null }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('📤 Guardando comprobante (URL) en backend:', {
      pedido_id: id,
      comprobante_url: datos.comprobante_pago,
      codigo_operacion: datos.codigo_operacion
    });

    return this.http.post<any>(`${this.urlApi}/ventas/${id}/comprobante`, datos, { headers });
  }

  /**
   * Crear pedido desde carrito
   */
  crearPedido(pedido: any): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/pedidos`, pedido);
  }

  /**
   * Listar todos los pedidos (ADMIN)
   */
  listarPedidos(filtros?: FiltrosPedidos): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.buscar) params = params.set('buscar', filtros.buscar);
      if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
      if (filtros.cliente_id) params = params.set('cliente_id', filtros.cliente_id.toString());
      if (filtros.per_page) params = params.set('per_page', filtros.per_page.toString());
      if (filtros.page) params = params.set('page', filtros.page.toString());
    }

    return this.http.get<any>(this.adminPedidosUrl, { params });
  }

  /**
   * Actualizar estado de pedido (ADMIN)
   */
  actualizarEstado(id: number, estado: string, observaciones?: string): Observable<any> {
    const body: any = { estado };
    if (observaciones) {
      body.observaciones = observaciones;
    }
    return this.http.put<any>(`${this.adminPedidosUrl}/${id}/estado`, body);
  }

  /**
   * Obtener color del badge según estado
   */
  obtenerColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': 'warning',
      'Confirmado': 'info',
      'En Proceso': 'primary',
      'Enviado': 'info',
      'Entregado': 'success',
      'Completado': 'success',
      'Cancelado': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  /**
   * Obtener ícono según estado
   */
  obtenerIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'Pendiente': '⏳',
      'Confirmado': '✓',
      'En Proceso': '🔄',
      'Enviado': '🚚',
      'Entregado': '📦',
      'Completado': '✅',
      'Cancelado': '❌'
    };
    return iconos[estado] || '📋';
  }

  /**
   * Obtener progreso del pedido (0-100%)
   */
  obtenerProgresoPedido(estado: string): number {
    const progreso: { [key: string]: number } = {
      'Pendiente': 20,
      'Confirmado': 40,
      'En Proceso': 60,
      'Enviado': 80,
      'Entregado': 90,
      'Completado': 100,
      'Cancelado': 0
    };
    return progreso[estado] || 0;
  }

  /**
   * Verificar si el pedido puede ser cancelado
   */
  puedeCancelar(estado: string): boolean {
    return ['Pendiente', 'Confirmado'].includes(estado);
  }

  /**
   * Obtener estados disponibles para transición (ADMIN)
   */
  obtenerSiguientesEstados(estadoActual: string): string[] {
    const transiciones: { [key: string]: string[] } = {
      'Pendiente': ['Confirmado', 'Cancelado'],
      'Confirmado': ['En Proceso', 'Cancelado'],
      'En Proceso': ['Enviado', 'Cancelado'],
      'Enviado': ['Entregado', 'Cancelado'],
      'Entregado': ['Completado'],
      'Completado': [],
      'Cancelado': []
    };
    return transiciones[estadoActual] || [];
  }
}