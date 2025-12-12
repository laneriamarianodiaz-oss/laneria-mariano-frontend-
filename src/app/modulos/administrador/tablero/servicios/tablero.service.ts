import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, forkJoin } from 'rxjs';
import { environment } from '../../../../../environments/environment';

interface EstadisticasTablero {
  ventasHoy: number;
  ventasMes: number;
  ticketPromedio: number;
  productosStockBajo: number;
  cambioVentasHoy: number;
  cambioVentasMes: number;
  cambioTicket: number;
}

interface VentaDiaria {
  fecha: string;
  total: number;
}

interface VentaReciente {
  id: number;
  numero: string;
  fecha: string;
  cliente: string;
  total: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
}

interface ProductoTop {
  id: number;
  nombre: string;
  cantidadVendida: number;
}

interface AlertaStock {
  id: number;
  nombre: string;
  codigo: string;
  stock: number;
  stockMinimo: number;
  estado: 'critico' | 'bajo' | 'normal';
}

@Injectable({
  providedIn: 'root'
})
export class TableroService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Obtener estadísticas principales
   */
  obtenerEstadisticas(): Observable<EstadisticasTablero> {
    return this.http.get<EstadisticasTablero>(`${this.apiUrl}/ventas/estadisticas`).pipe(
      map(response => {
        console.log('✅ Estadísticas recibidas:', response);
        return {
          ventasHoy: response.ventasHoy || 0,
          ventasMes: response.ventasMes || 0,
          ticketPromedio: response.ticketPromedio || 0,
          productosStockBajo: response.productosStockBajo || 0,
          cambioVentasHoy: response.cambioVentasHoy || 0,
          cambioVentasMes: response.cambioVentasMes || 0,
          cambioTicket: response.cambioTicket || 0
        };
      }),
      catchError(error => {
        console.error('❌ Error en estadísticas:', error);
        return of({
          ventasHoy: 0,
          ventasMes: 0,
          ticketPromedio: 0,
          productosStockBajo: 0,
          cambioVentasHoy: 0,
          cambioVentasMes: 0,
          cambioTicket: 0
        });
      })
    );
  }

  /**
   * Obtener ventas de la semana
   */
  obtenerVentasSemana(): Observable<VentaDiaria[]> {
    return this.http.get<VentaDiaria[]>(`${this.apiUrl}/ventas/semana`).pipe(
      catchError(error => {
        console.error('❌ Error en ventas semana:', error);
        return of([
          { fecha: 'Lun', total: 0 },
          { fecha: 'Mar', total: 0 },
          { fecha: 'Mié', total: 0 },
          { fecha: 'Jue', total: 0 },
          { fecha: 'Vie', total: 0 },
          { fecha: 'Sáb', total: 0 },
          { fecha: 'Dom', total: 0 }
        ]);
      })
    );
  }

  /**
   * Obtener ventas recientes
   */
  obtenerVentasRecientes(limite: number = 5): Observable<VentaReciente[]> {
    return this.http.get<VentaReciente[]>(`${this.apiUrl}/ventas/recientes?limite=${limite}`).pipe(
      catchError(error => {
        console.error('❌ Error en ventas recientes:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener top productos
   */
  obtenerTopProductos(limite: number = 5): Observable<ProductoTop[]> {
    return this.http.get<ProductoTop[]>(`${this.apiUrl}/ventas/top-productos?limite=${limite}`).pipe(
      catchError(error => {
        console.error('❌ Error en top productos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener alertas de stock
   */
  obtenerAlertasStock(): Observable<AlertaStock[]> {
    return this.http.get<AlertaStock[]>(`${this.apiUrl}/dashboard/alertas-stock`).pipe(
      catchError(error => {
        console.error('❌ Error en alertas stock:', error);
        return of([]);
      })
    );
  }

  /**
   * ⭐ NUEVO: Obtener todos los datos del dashboard en una sola llamada
   */
  obtenerDashboardCompleto(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/completo`).pipe(
      catchError(error => {
        console.error('❌ Error en dashboard completo:', error);
        return of(null);
      })
    );
  }

  /**
   * ⭐ Obtener todos los datos del dashboard (múltiples llamadas)
   */
  obtenerDatosDashboard(): Observable<any> {
    return forkJoin({
      estadisticas: this.obtenerEstadisticas(),
      ventasSemana: this.obtenerVentasSemana(),
      ventasRecientes: this.obtenerVentasRecientes(),
      topProductos: this.obtenerTopProductos(),
      alertasStock: this.obtenerAlertasStock()
    }).pipe(
      map(resultado => {
        console.log('📊 Dashboard completo:', resultado);
        return resultado;
      }),
      catchError(error => {
        console.error('❌ Error al cargar dashboard:', error);
        throw error;
      })
    );
  }
}