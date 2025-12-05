import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Cliente,
  RespuestaClientes,
  RespuestaCliente,
  FiltrosCliente,
  CrearClienteDTO,
  ActualizarClienteDTO,
  HistorialComprasCliente,
  EstadisticasCliente,
} from '../modelos/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly API_URL = `${environment.apiUrl}/clientes`;

  // Signals
  readonly clientes = signal<Cliente[]>([]);
  readonly clienteSeleccionado = signal<Cliente | null>(null);
  readonly historialCompras = signal<HistorialComprasCliente[]>([]);
  readonly estadisticas = signal<EstadisticasCliente | null>(null);
  readonly cargando = signal<boolean>(false);
  readonly totalRegistros = signal<number>(0);
  readonly paginaActual = signal<number>(1);
  readonly totalPaginas = signal<number>(1);

  // Computed signals
  readonly cantidadClientes = computed(() => this.clientes().length);
  readonly hayClientes = computed(() => this.clientes().length > 0);

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtener lista de clientes con filtros
   */
  obtenerClientes(filtros?: FiltrosCliente): Observable<RespuestaClientes> {
    this.cargando.set(true);

    let params = new HttpParams();

    // ⭐ CORREGIDO: Cambiar 'busqueda' a 'buscar' para coincidir con backend
    if (filtros?.busqueda) {
      params = params.set('buscar', filtros.busqueda);
    }

    if (filtros?.fecha_desde) {
      params = params.set('fecha_desde', filtros.fecha_desde);
    }

    if (filtros?.fecha_hasta) {
      params = params.set('fecha_hasta', filtros.fecha_hasta);
    }

    if (filtros?.pagina) {
      params = params.set('page', filtros.pagina.toString());
    }

    if (filtros?.por_pagina) {
      params = params.set('per_page', filtros.por_pagina.toString());
    }

return this.http
      .get<any>(this.API_URL, { params })
      .pipe(
        tap((respuesta) => {
          console.log('✅ Respuesta clientes:', respuesta);
          
          if (respuesta.success) {
            // Manejar estructura de paginación Laravel
            const paginacion = respuesta.data;
            let datos: Cliente[] = [];
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

            this.clientes.set(datos);
            this.totalRegistros.set(total);
            this.paginaActual.set(currentPage);
            this.totalPaginas.set(lastPage);
          }
          this.cargando.set(false);
        })
      );
  }
  /**
   * Obtener cliente por ID
   */
  obtenerCliente(clienteId: number): Observable<RespuestaCliente> {
    this.cargando.set(true);

    return this.http
      .get<any>(`${this.API_URL}/${clienteId}`)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Cliente detalle:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.clienteSeleccionado.set(respuesta.data);
          }
          this.cargando.set(false);
        })
      );
  }

  /**
   * Crear nuevo cliente
   */
  crearCliente(datos: CrearClienteDTO): Observable<RespuestaCliente> {
    return this.http
      .post<any>(this.API_URL, datos)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Cliente creado:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.clientes.update((clientes) => [
              respuesta.data,
              ...clientes,
            ]);
          }
        })
      );
  }

  /**
   * Actualizar cliente
   */
  actualizarCliente(
    clienteId: number,
    datos: ActualizarClienteDTO
  ): Observable<RespuestaCliente> {
    return this.http
      .put<any>(`${this.API_URL}/${clienteId}`, datos)
      .pipe(
        tap((respuesta) => {
          console.log('✅ Cliente actualizado:', respuesta);
          if (respuesta.success && respuesta.data) {
            this.actualizarClienteLocal(respuesta.data);
          }
        })
      );
  }

  /**
   * Eliminar cliente
   */
  eliminarCliente(clienteId: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.API_URL}/${clienteId}`
      )
      .pipe(
        tap((respuesta) => {
          console.log('✅ Cliente eliminado:', respuesta);
          if (respuesta.success) {
            this.clientes.update((clientes) =>
              clientes.filter((c) => c.cliente_id !== clienteId)
            );
          }
        })
      );
  }

  /**
   * Obtener historial de compras de un cliente
   */
  obtenerHistorialCompras(
    clienteId: number
  ): Observable<{ success: boolean; data: HistorialComprasCliente[] }> {
    return this.http
      .get<{ success: boolean; data: HistorialComprasCliente[] }>(
        `${this.API_URL}/${clienteId}/historial`
      )
      .pipe(
        tap((respuesta) => {
          console.log('✅ Historial compras:', respuesta);
          if (respuesta.success) {
            this.historialCompras.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Obtener estadísticas de clientes
   */
  obtenerEstadisticas(): Observable<{
    success: boolean;
    data: EstadisticasCliente;
  }> {
    return this.http
      .get<{ success: boolean; data: EstadisticasCliente }>(
        `${environment.apiUrl}/clientes/estadisticas`
      )
      .pipe(
        tap((respuesta) => {
          console.log('✅ Estadísticas clientes:', respuesta);
          if (respuesta.success) {
            this.estadisticas.set(respuesta.data);
          }
        })
      );
  }

  /**
   * Exportar clientes a Excel
   */
  exportarExcel(filtros?: FiltrosCliente): Observable<Blob> {
    let params = new HttpParams();

    // ⭐ CORREGIDO: Usar 'buscar' en lugar de 'busqueda'
    if (filtros?.busqueda) {
      params = params.set('buscar', filtros.busqueda);
    }

    if (filtros?.fecha_desde) {
      params = params.set('fecha_desde', filtros.fecha_desde);
    }

    if (filtros?.fecha_hasta) {
      params = params.set('fecha_hasta', filtros.fecha_hasta);
    }

    return this.http.get(`${this.API_URL}/exportar/excel`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Actualizar cliente en la lista local
   */
  private actualizarClienteLocal(clienteActualizado: Cliente): void {
    this.clientes.update((clientes) =>
      clientes.map((c) =>
        c.cliente_id === clienteActualizado.cliente_id
          ? clienteActualizado
          : c
      )
    );

    if (
      this.clienteSeleccionado()?.cliente_id ===
      clienteActualizado.cliente_id
    ) {
      this.clienteSeleccionado.set(clienteActualizado);
    }
  }

/**
 * Limpiar historial de compras
 */
limpiarClienteSeleccionado(): void {
  this.historialCompras.set([]);
}

  /**
   * Refrescar lista de clientes
   */
  refrescar(filtros?: FiltrosCliente): void {
    this.obtenerClientes(filtros).subscribe();
  }
}