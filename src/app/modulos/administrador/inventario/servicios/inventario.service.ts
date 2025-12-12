import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  ProductoInventario, 
  MovimientoStock, 
  AjusteStock, 
  EstadisticasInventario,
  FiltrosInventario 
} from '../modelos/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventario`;

  /**
   * 📦 Obtener todo el inventario con filtros
   */
  obtenerInventario(filtros?: FiltrosInventario): Observable<ProductoInventario[]> {
    let params = new HttpParams();
    
    if (filtros?.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    if (filtros?.categoria) {
      params = params.set('categoria', filtros.categoria);
    }
    if (filtros?.estado_stock) {
      params = params.set('estado', filtros.estado_stock);
    }
    if (filtros?.orden) {
      params = params.set('orden', filtros.orden);
    }
    if (filtros?.direccion) {
      params = params.set('direccion', filtros.direccion);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('✅ Respuesta del backend:', response);
        
        const items = response.data || response;
        
        if (!Array.isArray(items)) {
          console.error('❌ La respuesta no es un array:', items);
          return [];
        }
        
        console.log(`✅ ${items.length} productos encontrados`);
        if (items.length > 0) {
          console.log('📦 Primer producto:', items[0]);
        }
        
        return items.map(item => this.mapearProductoInventario(item));
      }),
      catchError(error => {
        console.error('❌ Error al obtener inventario:', error);
        return of([]);
      })
    );
  }

  /**
   * 📊 Obtener estadísticas del inventario
   */
  obtenerEstadisticas(): Observable<EstadisticasInventario> {
    return this.http.get<any>(`${this.apiUrl}/resumen/general`).pipe(
      map(response => {
        console.log('✅ Estadísticas del backend:', response);
        const data = response.data || response;
        
        return {
          total_productos: data.total_productos || 0,
          valor_total_inventario: data.valor_total_inventario || 0,
          productos_stock_critico: data.productos_stock_critico || 0,
          productos_stock_bajo: data.productos_stock_bajo || 0,
          productos_stock_normal: data.productos_stock_normal || 0,
          productos_exceso: data.productos_exceso || 0,
          movimientos_hoy: data.movimientos_hoy || 0,
          movimientos_mes: data.movimientos_mes || 0
        };
      }),
      catchError(error => {
        console.error('❌ Error al obtener estadísticas:', error);
        return of({
          total_productos: 0,
          valor_total_inventario: 0,
          productos_stock_critico: 0,
          productos_stock_bajo: 0,
          productos_stock_normal: 0,
          productos_exceso: 0,
          movimientos_hoy: 0,
          movimientos_mes: 0
        });
      })
    );
  }

  /**
   * 🚨 Obtener alertas de stock bajo
   */
  obtenerAlertasStockBajo(): Observable<ProductoInventario[]> {
    return this.http.get<any>(`${this.apiUrl}/alertas/stock-bajo`).pipe(
      map(response => {
        const data = response.data || response;
        const items = data.alertas || data;
        
        if (!Array.isArray(items)) return [];
        return items.map(item => this.mapearProductoInventario(item));
      }),
      catchError(error => {
        console.error('❌ Error al obtener alertas:', error);
        return of([]);
      })
    );
  }

  /**
   * 📜 Obtener historial de movimientos
   */
  obtenerHistorialMovimientos(
    productoId?: number, 
    limite: number = 50
  ): Observable<MovimientoStock[]> {
    let params = new HttpParams().set('limite', limite.toString());
    
    if (productoId) {
      params = params.set('producto_id', productoId.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/movimientos`, { params }).pipe(
      map(response => response.data || response),
      catchError(error => {
        console.error('❌ Error al obtener movimientos:', error);
        return of([]);
      })
    );
  }

  /**
   * 🔧 Actualizar stock de un producto
   */
  actualizarStock(productoId: number, ajuste: AjusteStock): Observable<any> {
    const payload = {
      cantidad: ajuste.cantidad,
      tipo: ajuste.tipo_movimiento,
      motivo: ajuste.motivo,
      referencia: ajuste.referencia
    };

    return this.http.put(`${this.apiUrl}/${productoId}/actualizar-stock`, payload).pipe(
      catchError(error => {
        console.error('❌ Error al actualizar stock:', error);
        throw error;
      })
    );
  }

  /**
   * 📉 Actualizar stock mínimo
   */
  actualizarStockMinimo(productoId: number, stockMinimo: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productoId}/stock-minimo`, {
      stock_minimo: stockMinimo
    }).pipe(
      catchError(error => {
        console.error('❌ Error al actualizar stock mínimo:', error);
        throw error;
      })
    );
  }

  /**
   * 🔧 Ajuste masivo de stock
   */
  ajusteMasivo(ajustes: AjusteStock[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajuste-masivo`, {
      ajustes
    }).pipe(
      catchError(error => {
        console.error('❌ Error en ajuste masivo:', error);
        throw error;
      })
    );
  }

  /**
   * 🗺️ MAPEO: Backend → Frontend
   * 
   * Backend envía:
   * - inventario_id
   * - codigo_lana
   * - nombre_producto
   * - producto_tipo
   * - categoria ⭐ NUEVO
   * - producto_color
   * - producto_precio
   * - stock_actual
   * - stock_minimo
   * - ultima_actualizacion
   */
  private mapearProductoInventario(item: any): ProductoInventario {
    const stock = item.stock_actual || 0;
    const stockMinimo = item.stock_minimo || 0;
    const precio = parseFloat(item.producto_precio) || 0;

    return {
      id: item.inventario_id,
      codigo_lana: item.codigo_lana || '',
      nombre: item.nombre_producto || 'Sin nombre',
      categoria: item.categoria || 'Sin categoría',  // ⭐ CAMPO CORRECTO
      tipo_lana: item.producto_tipo || '',
      color: item.producto_color || '',
      stock: stock,
      stock_minimo: stockMinimo,
      stock_maximo: item.stock_maximo,
      precio_unitario: precio,
      valor_total: stock * precio,
      estado_stock: this.determinarEstadoStock(stock, stockMinimo),
      ultima_actualizacion: item.ultima_actualizacion
    };
  }

  /**
   * 🎯 Determinar estado del stock
   */
  private determinarEstadoStock(
    stock: number, 
    stockMinimo: number
  ): 'critico' | 'bajo' | 'normal' | 'exceso' {
    if (stock === 0 || stock <= stockMinimo * 0.5) {
      return 'critico';
    } else if (stock <= stockMinimo) {
      return 'bajo';
    } else if (stock <= stockMinimo * 2) {
      return 'normal';
    } else {
      return 'exceso';
    }
  }
}