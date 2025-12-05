import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroService } from '../../servicios/tablero.service';

@Component({
  selector: 'app-tarjetas-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjetas-estadisticas.component.html',
  styleUrl: './tarjetas-estadisticas.component.css'
})
export class TarjetasEstadisticasComponent implements OnInit {
  
  private tableroService = inject(TableroService);
  
  // ✅ Inicializar con valores por defecto
  @Input() estadisticas: any = {
    ventasHoy: 0,
    ventasMes: 0,
    ticketPromedio: 0,
    productosStockBajo: 0,
    cambioVentasHoy: 0,
    cambioVentasMes: 0,
    cambioTicket: 0
  };

  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    
    this.tableroService.obtenerEstadisticas().subscribe({
      next: (data) => {
        console.log('📊 Datos recibidos en componente:', data);
        
        // ✅ Asignar directamente los datos recibidos
        this.estadisticas = {
          ventasHoy: data.ventasHoy || 0,
          ventasMes: data.ventasMes || 0,
          ticketPromedio: data.ticketPromedio || 0,
          productosStockBajo: data.productosStockBajo || 0,
          cambioVentasHoy: data.cambioVentasHoy || 0,
          cambioVentasMes: data.cambioVentasMes || 0,
          cambioTicket: data.cambioTicket || 0
        };
        
        this.cargando = false;
        console.log('✅ Estadísticas actualizadas:', this.estadisticas);
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        this.cargando = false;
      }
    });
  }

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