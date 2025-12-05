import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Proveedor,
  RespuestaProveedores,
  RespuestaProveedor,
  FiltrosProveedor,
  CrearProveedorDTO,
  ActualizarProveedorDTO,
  RespuestaProductosProveedor,
  ProductoProveedor,
  EstadisticasProveedores,
  RespuestaEstadisticasProveedores,
} from '../modelos/proveedor.model';

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/proveedores`;

  // Signals para gestión de estado
  readonly proveedores = signal<Proveedor[]>([]);
  readonly proveedorSeleccionado = signal<Proveedor | null>(null);
  readonly productosProveedor = signal<ProductoProveedor[]>([]);
  readonly estadisticas = signal<EstadisticasProveedores | null>(null);
  readonly cargando = signal<boolean>(false);
  readonly totalRegistros = signal<number>(0);
  readonly paginaActual = signal<number>(1);
  readonly totalPaginas = signal<number>(1);

  // Computed signals
  readonly cantidadProveedores = computed(() => this.proveedores().length);
  readonly hayProveedores = computed(() => this.cantidadProveedores() > 0);

  /**
   * Obtener lista de proveedores con filtros
   */
  obtenerProveedores(filtros?: FiltrosProveedor): Observable<RespuestaProveedores> {
    this.cargando.set(true);

    let params = new HttpParams();

    if (filtros) {
      if (filtros.busqueda) {
        params = params.set('buscar', filtros.busqueda);
      }
      if (filtros.fecha_desde) {
        params = params.set('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        params = params.set('fecha_hasta', filtros.fecha_hasta);
      }
      if (filtros.pagina) {
        params = params.set('page', filtros.pagina.toString());
      }
      if (filtros.por_pagina) {
        params = params.set('per_page', filtros.por_pagina.toString());
      }
    }

    return this.http
      .get<any>(this.API_URL, { params })
      .pipe(
        tap((respuesta) => {
          console.log('✅ Respuesta proveedores:', respuesta);
          
          if (respuesta.success) {
            const paginacion = respuesta.data;
            let datos: Proveedor[] = [];
            let total = 0;
            let currentPage = 1;
            let lastPage = 1;

            if (paginacion && typeof paginacion === 'object' && 'data' in paginacion) {
              datos = paginacion.data;
              total = paginacion.total;
              currentPage = paginacion.current_page;
              lastPage = paginacion.last_page;
            } else if (Array.isArray(paginacion)) {
              datos = paginacion;
              total = datos.length;
            }

            this.proveedores.set(datos);
            this.totalRegistros.set(total);
            this.paginaActual.set(currentPage);
            this.totalPaginas.set(lastPage);
          }
          this.cargando.set(false);
        })
      );
  }

  /**
   * Obtener un proveedor por ID
   */
  obtenerProveedor(proveedorId: number): Observable<RespuestaProveedor> {
    return this.http
      .get<any>(`${this.API_URL}/${proveedorId}`)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Proveedor detalle:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.proveedorSeleccionado.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Crear nuevo proveedor
   */
  crearProveedor(datos: CrearProveedorDTO): Observable<RespuestaProveedor> {
    return this.http
      .post<any>(this.API_URL, datos)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Proveedor creado:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.proveedores.update((proveedores) => [
              respuesta.data,
              ...proveedores,
            ]);
          }
        })
      );
  }

  /**
   * Actualizar proveedor existente
   */
  actualizarProveedor(
    proveedorId: number,
    datos: ActualizarProveedorDTO
  ): Observable<RespuestaProveedor> {
    return this.http
      .put<any>(`${this.API_URL}/${proveedorId}`, datos)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Proveedor actualizado:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.actualizarProveedorLocal(respuesta.data);
          }
        })
      );
  }

  /**
   * Eliminar proveedor
   */
  eliminarProveedor(
    proveedorId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.API_URL}/${proveedorId}`
      )
      .pipe(
        tap((respuesta) => {
          console.log('✅ Proveedor eliminado:', respuesta);
          if (respuesta.success) {
            this.proveedores.update((proveedores) =>
              proveedores.filter((p) => p.proveedor_id !== proveedorId)
            );
          }
        })
      );
  }

  /**
   * Obtener productos suministrados por un proveedor
   */
  obtenerProductosProveedor(
    proveedorId: number
  ): Observable<RespuestaProductosProveedor> {
    return this.http
      .get<any>(
        `${this.API_URL}/${proveedorId}/productos`
      )
      .pipe(
        tap((respuesta) => {
          console.log('✅ Productos proveedor:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.productosProveedor.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Obtener estadísticas de proveedores
   */
  obtenerEstadisticas(): Observable<RespuestaEstadisticasProveedores> {
    return this.http
      .get<any>(`${environment.apiUrl}/proveedores/estadisticas`)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Estadísticas proveedores:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.estadisticas.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Exportar proveedores a Excel
   */
  exportarExcel(filtros?: FiltrosProveedor): Observable<Blob> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.busqueda) {
        params = params.set('buscar', filtros.busqueda);
      }
      if (filtros.fecha_desde) {
        params = params.set('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        params = params.set('fecha_hasta', filtros.fecha_hasta);
      }
    }

    return this.http.get(`${this.API_URL}/exportar/excel`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Actualizar proveedor en lista local
   */
  private actualizarProveedorLocal(proveedorActualizado: Proveedor): void {
    this.proveedores.update((proveedores) =>
      proveedores.map((p) =>
        p.proveedor_id === proveedorActualizado.proveedor_id
          ? proveedorActualizado
          : p
      )
    );

    if (
      this.proveedorSeleccionado()?.proveedor_id ===
      proveedorActualizado.proveedor_id
    ) {
      this.proveedorSeleccionado.set(proveedorActualizado);
    }
  }

  /**
   * Limpiar proveedor seleccionado
   */
  limpiarProveedorSeleccionado(): void {
    this.proveedorSeleccionado.set(null);
    this.productosProveedor.set([]);
  }

  /**
   * Refrescar datos
   */
  refrescar(filtros?: FiltrosProveedor): void {
    this.obtenerProveedores(filtros).subscribe();
    this.obtenerEstadisticas().subscribe();
  }
}