import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class TableroService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // laneria-mariano-backend-production.up.railway.app/api/v1

  obtenerEstadisticas(): Observable<EstadisticasTablero> {
    // ✅ CORRECTO: Agregamos la barra "/" al inicio
    return this.http.get<any>(`${this.apiUrl}/ventas/estadisticas`).pipe(
      map(response => {
        console.log('✅ Respuesta del backend:', response);
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
        console.error('❌ Error en tablero service:', error);
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

  obtenerAlertasStock(): Observable<any[]> {
    // ✅ CORRECTO: Agregamos la barra "/" al inicio
    return this.http.get<any[]>(`${this.apiUrl}/inventario/alertas/stock-bajo`).pipe(
      catchError(error => {
        console.error('❌ Error al obtener alertas de stock:', error);
        return of([]);
      })
    );
  }

  obtenerVentasRecientes(limite: number = 5): Observable<any[]> {
    // ✅ CORRECTO: Agregamos la barra "/" al inicio
    return this.http.get<any[]>(`${this.apiUrl}/ventas?limite=${limite}`).pipe(
      catchError(error => {
        console.error('❌ Error al obtener ventas recientes:', error);
        return of([]);
      })
    );
  }
}