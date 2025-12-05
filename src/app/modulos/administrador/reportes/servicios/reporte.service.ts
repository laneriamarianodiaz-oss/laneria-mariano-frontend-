import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import {
  EstadisticasGenerales,
  RespuestaEstadisticasGenerales,
  VentasPorPeriodo,
  RespuestaVentasPorPeriodo,
  ProductoMasVendido,
  RespuestaProductosMasVendidos,
  VentaPorMetodoPago,
  RespuestaVentasPorMetodoPago,
  VentaPorCanal,
  RespuestaVentasPorCanal,
  EstadisticasInventario,
  RespuestaEstadisticasInventario,
  EstadisticasClientes,
  RespuestaEstadisticasClientes,
  FiltrosReporte,
  OpcionesExportacion,
} from '../modelos/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/reportes`;

  // ============================
  // SIGNALS - ESTADO
  // ============================

  // Dashboard general
  estadisticasGenerales = signal<EstadisticasGenerales | null>(null);

  // Ventas
  ventasPorPeriodo = signal<VentasPorPeriodo | null>(null);
  productosMasVendidos = signal<ProductoMasVendido[]>([]);
  ventasPorMetodoPago = signal<VentaPorMetodoPago[]>([]);
  ventasPorCanal = signal<VentaPorCanal[]>([]);

  // Inventario
  estadisticasInventario = signal<EstadisticasInventario | null>(null);

  // Clientes
  estadisticasClientes = signal<EstadisticasClientes | null>(null);

  // Estado de carga
  cargando = signal<boolean>(false);
  cargandoExportacion = signal<boolean>(false);

  // ============================
  // COMPUTED SIGNALS
  // ============================

  hayEstadisticas = computed(() => this.estadisticasGenerales() !== null);

  // ============================
  // MÉTODOS HTTP - DASHBOARD
  // ============================

  /**
   * Obtener estadísticas generales del dashboard
   */
  obtenerEstadisticasGenerales(): Observable<RespuestaEstadisticasGenerales> {
    this.cargando.set(true);

    return this.http
      .get<RespuestaEstadisticasGenerales>(`${this.API_URL}/dashboard`)
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.estadisticasGenerales.set(respuesta.data);
          }
          this.cargando.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al obtener estadísticas generales:', error);
          this.cargando.set(false);
          return of({
            success: false,
            data: {
              ventas_hoy: 0,
              ventas_mes: 0,
              ventas_ano: 0,
              total_clientes: 0,
              total_productos: 0,
              productos_stock_bajo: 0,
              pedidos_pendientes: 0,
              ticket_promedio: 0,
            },
          });
        })
      );
  }

  // ============================
  // MÉTODOS HTTP - VENTAS
  // ============================

  /**
   * Obtener ventas por período
   */
  obtenerVentasPorPeriodo(
    filtros: FiltrosReporte
  ): Observable<RespuestaVentasPorPeriodo> {
    this.cargando.set(true);

    let params = new HttpParams();
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
    if (filtros.agrupar_por) params = params.set('agrupar_por', filtros.agrupar_por);

    return this.http
      .get<RespuestaVentasPorPeriodo>(`${this.API_URL}/ventas/periodo`, {
        params,
      })
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.ventasPorPeriodo.set(respuesta.data);
          }
          this.cargando.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al obtener ventas por período:', error);
          this.cargando.set(false);
          return of({
            success: false,
            data: {
              fecha_inicio: '',
              fecha_fin: '',
              total_ventas: 0,
              cantidad_pedidos: 0,
              ticket_promedio: 0,
              ventas_por_dia: [],
            },
          });
        })
      );
  }

  /**
   * Obtener productos más vendidos
   */
  obtenerProductosMasVendidos(
    filtros: FiltrosReporte
  ): Observable<RespuestaProductosMasVendidos> {
    this.cargando.set(true);

    let params = new HttpParams();
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
    if (filtros.top) params = params.set('top', filtros.top.toString());

    return this.http
      .get<RespuestaProductosMasVendidos>(
        `${this.API_URL}/productos/mas-vendidos`,
        { params }
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.productosMasVendidos.set(respuesta.data);
          }
          this.cargando.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al obtener productos más vendidos:', error);
          this.cargando.set(false);
          return of({ success: false, data: [] });
        })
      );
  }

  /**
   * Obtener ventas por método de pago
   */
  obtenerVentasPorMetodoPago(
    filtros: FiltrosReporte
  ): Observable<RespuestaVentasPorMetodoPago> {
    let params = new HttpParams();
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);

    return this.http
      .get<RespuestaVentasPorMetodoPago>(
        `${this.API_URL}/ventas/metodos-pago`,
        { params }
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.ventasPorMetodoPago.set(respuesta.data);
          }
        }),
        catchError((error) => {
          console.error('❌ Error al obtener ventas por método de pago:', error);
          return of({ success: false, data: [] });
        })
      );
  }

  /**
   * Obtener ventas por canal
   */
  obtenerVentasPorCanal(
    filtros: FiltrosReporte
  ): Observable<RespuestaVentasPorCanal> {
    let params = new HttpParams();
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);

    return this.http
      .get<RespuestaVentasPorCanal>(`${this.API_URL}/ventas/canales`, {
        params,
      })
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.ventasPorCanal.set(respuesta.data);
          }
        }),
        catchError((error) => {
          console.error('❌ Error al obtener ventas por canal:', error);
          return of({ success: false, data: [] });
        })
      );
  }

  // ============================
  // MÉTODOS HTTP - INVENTARIO
  // ============================

  /**
   * Obtener estadísticas de inventario
   */
  obtenerEstadisticasInventario(): Observable<RespuestaEstadisticasInventario> {
    this.cargando.set(true);

    return this.http
      .get<RespuestaEstadisticasInventario>(
        `${this.API_URL}/inventario/estadisticas`
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.estadisticasInventario.set(respuesta.data);
          }
          this.cargando.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al obtener estadísticas de inventario:', error);
          this.cargando.set(false);
          return of({
            success: false,
            data: {
              total_productos: 0,
              productos_activos: 0,
              productos_stock_bajo: 0,
              productos_sin_stock: 0,
              valor_total_inventario: 0,
              productos_stock_bajo_lista: [],
            },
          });
        })
      );
  }

  // ============================
  // MÉTODOS HTTP - CLIENTES
  // ============================

  /**
   * Obtener estadísticas de clientes
   */
  obtenerEstadisticasClientes(): Observable<RespuestaEstadisticasClientes> {
    this.cargando.set(true);

    return this.http
      .get<RespuestaEstadisticasClientes>(
        `${this.API_URL}/clientes/estadisticas`
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.estadisticasClientes.set(respuesta.data);
          }
          this.cargando.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al obtener estadísticas de clientes:', error);
          this.cargando.set(false);
          return of({
            success: false,
            data: {
              total_clientes: 0,
              clientes_activos: 0,
              clientes_nuevos_mes: 0,
              clientes_frecuentes: 0,
              top_clientes: [],
            },
          });
        })
      );
  }

  // ============================
  // MÉTODOS HTTP - EXPORTACIÓN
  // ============================

  /**
   * Exportar reporte a Excel
   */
  exportarExcel(opciones: OpcionesExportacion): Observable<Blob> {
    this.cargandoExportacion.set(true);

    let params = new HttpParams();
    if (opciones.fecha_inicio)
      params = params.set('fecha_inicio', opciones.fecha_inicio);
    if (opciones.fecha_fin) params = params.set('fecha_fin', opciones.fecha_fin);

    return this.http
      .get(`${this.API_URL}/exportar/excel`, {
        params,
        responseType: 'blob',
      })
      .pipe(
        tap(() => {
          this.cargandoExportacion.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al exportar a Excel:', error);
          this.cargandoExportacion.set(false);
          throw error;
        })
      );
  }

  /**
   * Exportar reporte a PDF
   */
  exportarPDF(opciones: OpcionesExportacion): Observable<Blob> {
    this.cargandoExportacion.set(true);

    let params = new HttpParams();
    if (opciones.fecha_inicio)
      params = params.set('fecha_inicio', opciones.fecha_inicio);
    if (opciones.fecha_fin) params = params.set('fecha_fin', opciones.fecha_fin);
    if (opciones.incluir_graficos !== undefined)
      params = params.set(
        'incluir_graficos',
        opciones.incluir_graficos.toString()
      );

    return this.http
      .get(`${this.API_URL}/exportar/pdf`, {
        params,
        responseType: 'blob',
      })
      .pipe(
        tap(() => {
          this.cargandoExportacion.set(false);
        }),
        catchError((error) => {
          console.error('❌ Error al exportar a PDF:', error);
          this.cargandoExportacion.set(false);
          throw error;
        })
      );
  }

  // ============================
  // MÉTODOS AUXILIARES
  // ============================

  /**
   * Refrescar todos los datos del dashboard
   */
  refrescarDashboard(): void {
    this.obtenerEstadisticasGenerales().subscribe();
  }

  /**
   * Limpiar todos los datos
   */
  limpiarDatos(): void {
    this.estadisticasGenerales.set(null);
    this.ventasPorPeriodo.set(null);
    this.productosMasVendidos.set([]);
    this.ventasPorMetodoPago.set([]);
    this.ventasPorCanal.set([]);
    this.estadisticasInventario.set(null);
    this.estadisticasClientes.set(null);
  }
}