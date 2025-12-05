import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  Venta,
  RespuestaVentas,
  RespuestaVenta,
  FiltrosVenta,
  EstadisticasVentas,
  ActualizarEstadoVenta,
} from '../modelos/venta.model';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/ventas`;

  // Signals
  readonly ventas = signal<Venta[]>([]);
  readonly ventaSeleccionada = signal<Venta | null>(null);
  readonly estadisticas = signal<EstadisticasVentas | null>(null);
  readonly cargando = signal<boolean>(false);
  readonly totalRegistros = signal<number>(0);
  readonly paginaActual = signal<number>(1);
  readonly totalPaginas = signal<number>(1);

  // Computed signals
  readonly ventasPendientes = computed(() =>
    this.ventas().filter((v) => v.estado_venta === 'Pendiente')
  );

  readonly ventasCompletadas = computed(() =>
    this.ventas().filter((v) => v.estado_venta === 'Completada')
  );

  readonly ventasCanceladas = computed(() =>
    this.ventas().filter((v) => v.estado_venta === 'Cancelada')
  );

  readonly totalVentasHoy = computed(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return this.ventas()
      .filter((v) => v.fecha_venta.startsWith(hoy))
      .reduce((sum, v) => sum + v.total_venta, 0);
  });

  /**
   * Obtener lista de ventas con filtros
   */
  obtenerVentas(filtros?: FiltrosVenta): Observable<RespuestaVentas> {
    this.cargando.set(true);

    let params = new HttpParams();

    if (filtros) {
      if (filtros.fecha_desde) params = params.set('fecha_inicio', filtros.fecha_desde);
      if (filtros.fecha_hasta) params = params.set('fecha_fin', filtros.fecha_hasta);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.metodo_pago) params = params.set('metodo_pago', filtros.metodo_pago);
      if (filtros.canal_venta) params = params.set('canal_venta', filtros.canal_venta);
      if (filtros.cliente_id) params = params.set('cliente_id', filtros.cliente_id.toString());
      if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
      if (filtros.pagina) params = params.set('page', filtros.pagina.toString());
      if (filtros.por_pagina) params = params.set('per_page', filtros.por_pagina.toString());
    }

    return this.http
      .get<any>(this.API_URL, { params })
      .pipe(
        tap((respuesta) => {
          console.log('✅ Respuesta backend ventas:', respuesta);
          
          if (respuesta.success) {
            // ⭐ CAMBIO: Verificar si data tiene estructura de paginación
            const paginacion = respuesta.data;
            let datos: Venta[] = [];
            let total = 0;
            let currentPage = 1;
            let lastPage = 1;

            // Si tiene la estructura de paginación de Laravel
            if (paginacion && typeof paginacion === 'object' && 'data' in paginacion) {
              datos = paginacion.data;
              total = paginacion.total;
              currentPage = paginacion.current_page;
              lastPage = paginacion.last_page;
            } else if (Array.isArray(paginacion)) {
              // Si es un array directo
              datos = paginacion;
              total = datos.length;
            }
            
            this.ventas.set(datos);
            this.totalRegistros.set(total);
            this.paginaActual.set(currentPage);
            this.totalPaginas.set(lastPage);
          }
          this.cargando.set(false);
        })
      );
  }

  /**
   * Obtener una venta específica por ID
   */
  obtenerVenta(ventaId: number): Observable<RespuestaVenta> {
    return this.http
      .get<RespuestaVenta>(`${this.API_URL}/${ventaId}`)
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.ventaSeleccionada.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Obtener estadísticas de ventas
   */
  obtenerEstadisticas(): Observable<{ success: boolean; data: EstadisticasVentas }> {
    return this.http
      .get<{ success: boolean; data: EstadisticasVentas }>(
        `${this.API_URL}/estadisticas`
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.estadisticas.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Cambiar estado de una venta
   */
  cambiarEstado(
    ventaId: number,
    nuevoEstado: 'Pendiente' | 'Completada' | 'Cancelada',
    observaciones?: string
  ): Observable<RespuestaVenta> {
    const datos = {
      estado: nuevoEstado,
      observaciones,
    };

    return this.http
      .put<RespuestaVenta>(`${this.API_URL}/${ventaId}/estado`, datos)
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.actualizarVentaLocal(respuesta.data);
          }
        })
      );
  }

  /**
   * Generar comprobante PDF
   * Por ahora el backend devuelve JSON, más adelante se implementará PDF real
   */
  generarComprobante(ventaId: number, tipoComprobante: 'Boleta' | 'Factura' | 'Recibo' = 'Boleta'): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${ventaId}/comprobante`, {
      tipo_comprobante: tipoComprobante
    }).pipe(
      map(respuesta => {
        console.log('✅ Comprobante generado:', respuesta);
        // Si el backend devuelve success, crear un blob vacío por ahora
        // TODO: Implementar generación real de PDF en el backend
        return new Blob(['Comprobante generado'], { type: 'application/pdf' });
      })
    );
  }

  /**
   * Exportar ventas a Excel
   */
  exportarExcel(filtros?: FiltrosVenta): Observable<Blob> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.fecha_desde) params = params.set('fecha_inicio', filtros.fecha_desde);
      if (filtros.fecha_hasta) params = params.set('fecha_fin', filtros.fecha_hasta);
      if (filtros.estado) params = params.set('estado', filtros.estado);
    }

    return this.http.get(`${this.API_URL}/exportar/excel`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Actualizar venta en la lista local
   */
  private actualizarVentaLocal(ventaActualizada: Venta): void {
    const ventasActuales = this.ventas();
    const index = ventasActuales.findIndex(
      (v) => v.venta_id === ventaActualizada.venta_id
    );

    if (index !== -1) {
      const nuevasVentas = [...ventasActuales];
      nuevasVentas[index] = ventaActualizada;
      this.ventas.set(nuevasVentas);
    }
  }

  /**
   * Limpiar venta seleccionada
   */
  limpiarVentaSeleccionada(): void {
    this.ventaSeleccionada.set(null);
  }

  /**
   * Refrescar lista de ventas
   */
  refrescar(filtros?: FiltrosVenta): void {
    this.obtenerVentas(filtros).subscribe();
  }
}