import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjetas-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjetas-estadisticas.component.html',
  styleUrl: './tarjetas-estadisticas.component.css'
})
export class TarjetasEstadisticasComponent {
  
  // ✅ Recibir estadísticas desde el componente padre
  @Input() estadisticas: any = {
    ventasHoy: 0,
    ventasMes: 0,
    ticketPromedio: 0,
    productosStockBajo: 0,
    cambioVentasHoy: 0,
    cambioVentasMes: 0,
    cambioTicket: 0
  };

  /**
   * Formatea un número como moneda peruana
   */
  formatearMoneda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return 'S/ 0.00';
    }
    return `S/ ${valor.toFixed(2)}`;
  }

  /**
   * Formatea un porcentaje
   */
  formatearPorcentaje(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return '0%';
    }
    const signo = valor >= 0 ? '+' : '';
    return `${signo}${valor.toFixed(1)}%`;
  }

  /**
   * Determina si el cambio es positivo
   */
  esPositivo(valor: number | null | undefined): boolean {
    return (valor || 0) >= 0;
  }
}