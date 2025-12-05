import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasVentas } from '../../modelos/venta.model';

@Component({
  selector: 'app-estadisticas-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-ventas.component.html',
  styleUrls: ['./estadisticas-ventas.component.css'],
})
export class EstadisticasVentasComponent {
  @Input() estadisticas: EstadisticasVentas | null = null;

  /**
   * Obtener porcentaje de cambio
   */
  obtenerPorcentajeCambio(actual: number, anterior: number): number {
    if (anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
  }

  /**
   * Formatear número como moneda
   */
  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  /**
   * Obtener métodos de pago ordenados
   */
  obtenerMetodosPagoOrdenados(): { metodo: string; total: number }[] {
    if (!this.estadisticas?.ventas_por_metodo_pago) return [];

    return Object.entries(this.estadisticas.ventas_por_metodo_pago)
      .map(([metodo, total]) => ({ metodo, total }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Obtener canales ordenados
   */
  obtenerCanalesOrdenados(): { canal: string; total: number }[] {
    if (!this.estadisticas?.ventas_por_canal) return [];

    return Object.entries(this.estadisticas.ventas_por_canal)
      .map(([canal, total]) => ({ canal, total }))
      .sort((a, b) => b.total - a.total);
  }
}