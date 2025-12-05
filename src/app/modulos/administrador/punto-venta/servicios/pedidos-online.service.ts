import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export type EstadoVenta = 'Pendiente' | 'Confirmado' | 'En Proceso' | 'Enviado' | 'Entregado' | 'Completado' | 'Cancelado';

export interface VentaOnline {
  venta_id: number;
  numero_venta: string;
  cliente_id: number;
  cliente_nombre: string;
  cliente_telefono?: string;
  items: ItemVenta[];
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: string;
  canal_venta: string;
  estado_venta: EstadoVenta;
  fecha_venta: string;
  observaciones?: string;
  // ✅ PROPIEDADES PARA COMPROBANTE YAPE
  comprobante_pago?: string;
  codigo_operacion?: string;
}

export interface ItemVenta {
  producto_id: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface RespuestaVentas {
  success: boolean;
  data: VentaOnline[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PedidosOnlineService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/ventas`;
  
  // Signals
  readonly ventas = signal<VentaOnline[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly ultimaActualizacion = signal<Date | null>(null);

  // Computed signals - Solo ventas online (no de tienda física)
  readonly ventasOnline = computed(() =>
    this.ventas().filter((v) => v.canal_venta !== 'Tienda física')
  );

  readonly pedidosPendientes = computed(() =>
    this.ventasOnline().filter((v) => v.estado_venta === 'Pendiente')
  );

  readonly pedidosConfirmados = computed(() =>
    this.ventasOnline().filter((v) => v.estado_venta === 'Confirmado')
  );

  readonly pedidosCompletados = computed(() =>
    this.ventasOnline().filter((v) => v.estado_venta === 'Completado')
  );

  readonly cantidadPendientes = computed(
    () => this.pedidosPendientes().length
  );

  readonly estaCargando = computed(() => this.cargando());

  /**
   * Obtener ventas online (pedidos)
   */
  obtenerPedidosActivos(): Observable<RespuestaVentas> {
    this.cargando.set(true);

    const params = new HttpParams().set('per_page', '50');

    return this.http
      .get<any>(`${this.API_URL}`, { params })
      .pipe(
        map(response => {
          console.log('📦 Respuesta ventas:', response);
          
          const ventas = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
          
          return {
            success: true,
            data: ventas.map(this.mapearVenta)
          };
        }),
        tap((respuesta) => {
          if (respuesta.success) {
            this.ventas.set(respuesta.data);
            this.ultimaActualizacion.set(new Date());
          }
          this.cargando.set(false);
        })
      );
  }

  /**
   * Mapear venta del backend al formato del frontend
   */
  private mapearVenta(venta: any): VentaOnline {
    return {
      venta_id: venta.venta_id,
      numero_venta: venta.numero_venta || `V-${String(venta.venta_id).padStart(6, '0')}`,
      cliente_id: venta.cliente?.cliente_id || venta.cliente_id,
      cliente_nombre: venta.cliente?.nombre || venta.cliente_nombre || 'Cliente',
      cliente_telefono: venta.cliente?.telefono || venta.telefono_contacto,
      items: (venta.productos || venta.detalles || []).map((item: any) => ({
        producto_id: item.producto_id,
        nombre_producto: item.nombre || item.producto?.nombre_producto || 'Producto',
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.precio_unitario),
        subtotal: parseFloat(item.subtotal)
      })),
      subtotal: parseFloat(venta.subtotal || 0),
      descuento: parseFloat(venta.descuento || 0),
      total: parseFloat(venta.total_venta || venta.total || 0),
      metodo_pago: venta.metodo_pago,
      canal_venta: venta.canal_venta,
      estado_venta: venta.estado_venta,
      fecha_venta: venta.fecha_venta,
      observaciones: venta.observaciones,
      // ✅ MAPEAR COMPROBANTE YAPE
      comprobante_pago: venta.comprobante_pago,
      codigo_operacion: venta.codigo_operacion
    };
  }

  /**
   * Confirmar pedido (cambiar estado a Confirmado)
   */
  confirmarPedido(ventaId: number): Observable<any> {
    return this.http
      .put(`${this.API_URL}/${ventaId}/estado`, { 
        estado: 'Confirmado',
        observaciones: 'Pedido confirmado desde panel admin'
      })
      .pipe(
        tap(() => {
          this.obtenerPedidosActivos().subscribe();
        })
      );
  }

  /**
   * Completar pedido (cambiar estado a Completado)
   */
  completarPedido(ventaId: number): Observable<any> {
    return this.http
      .put(`${this.API_URL}/${ventaId}/estado`, { 
        estado: 'Completado',
        observaciones: 'Pedido completado'
      })
      .pipe(
        tap(() => {
          this.obtenerPedidosActivos().subscribe();
        })
      );
  }

  /**
   * Cambiar estado de pedido
   */
  cambiarEstado(ventaId: number, nuevoEstado: EstadoVenta, observaciones?: string): Observable<any> {
    return this.http
      .put(`${this.API_URL}/${ventaId}/estado`, { 
        estado: nuevoEstado,
        observaciones: observaciones || `Estado cambiado a ${nuevoEstado}`
      })
      .pipe(
        tap(() => {
          this.obtenerPedidosActivos().subscribe();
        })
      );
  }

  /**
   * Cancelar pedido
   */
  cancelarPedido(ventaId: number, motivo: string): Observable<any> {
    return this.http
      .put(`${this.API_URL}/${ventaId}/estado`, { 
        estado: 'Cancelado',
        observaciones: motivo 
      })
      .pipe(
        tap(() => {
          this.obtenerPedidosActivos().subscribe();
        })
      );
  }

  /**
   * ✅ MÉTODO PARA RECHAZAR POR COMPROBANTE INVÁLIDO
   */
  actualizarEstado(ventaId: number, datos: { estado: string; observaciones?: string }): Observable<any> {
    return this.http
      .put(`${this.API_URL}/${ventaId}/estado`, datos)
      .pipe(
        tap(() => {
          this.obtenerPedidosActivos().subscribe();
        })
      );
  }

  /**
   * Iniciar polling automático cada 30 segundos
   */
  iniciarPolling(): Observable<RespuestaVentas> {
    return interval(30000).pipe(
      switchMap(() => this.obtenerPedidosActivos())
    );
  }

  /**
   * Actualizar estado de pedido (para el panel admin)
   */
  actualizarEstadoPedido(
    ventaId: number, 
    nuevoEstado: string, 
    observaciones?: string
  ): Observable<any> {
    return this.http.put(`${this.API_URL}/${ventaId}/estado`, {
      estado: nuevoEstado,
      observaciones: observaciones
    }).pipe(
      tap(() => {
        this.obtenerPedidosActivos().subscribe();
      })
    );
  }

  /**
   * Listar pedidos con filtros
   */
  listarPedidos(filtros?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined) {
          params = params.set(key, filtros[key]);
        }
      });
    }
    
    return this.http.get<any>(this.API_URL, { params }).pipe(
      map(response => {
        const ventas = Array.isArray(response.data?.data) ? response.data.data : 
                       Array.isArray(response.data) ? response.data : [];
        
        return {
          success: true,
          data: ventas.map((v: any) => this.mapearVenta(v))
        };
      })
    );
  }

  /**
   * Obtener UN pedido específico por ID
   */
  obtenerPedido(ventaId: number): Observable<any> {
    console.log('🔍 Obteniendo pedido individual:', ventaId);
    
    return this.http.get<any>(`${this.API_URL}/${ventaId}`).pipe(
      map(response => {
        console.log('📦 Respuesta backend (pedido individual):', response);
        
        return {
          success: response.success || true,
          data: response.data || response
        };
      }),
      tap(result => {
        console.log('✅ Pedido mapeado:', result.data);
      })
    );
  }
}