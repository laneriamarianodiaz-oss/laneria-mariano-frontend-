import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReporteService } from '../../servicios/reporte.service';
import { GraficoVentasComponent } from '../grafico-ventas/grafico-ventas.component';
import { ProductosVendidosComponent } from '../productos-vendidos/productos-vendidos.component';
import { GraficoMetodosPagoComponent } from '../grafico-metodos-pago/grafico-metodos-pago.component';

@Component({
  selector: 'app-tablero-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GraficoVentasComponent,
    ProductosVendidosComponent,
    GraficoMetodosPagoComponent,
  ],
  templateUrl: './tablero-reportes.component.html',
  styleUrls: ['./tablero-reportes.component.css'],
})
export class TableroReportesComponent implements OnInit {
  // Inyección de dependencias
  private readonly reporteService = inject(ReporteService);
  private readonly router = inject(Router);

  // Signals del servicio
  estadisticas = this.reporteService.estadisticasGenerales;
  cargando = this.reporteService.cargando;

  // Signals locales
  fechaActualizacion = signal<string>('');
  periodoSeleccionado = signal<string>('mes'); // 'hoy', 'semana', 'mes', 'ano'
  mostrarGraficos = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.reporteService.obtenerEstadisticasGenerales().subscribe({
      next: () => {
        this.actualizarFecha();
      },
      error: (error) => {
        console.error('❌ Error al cargar tablero:', error);
        alert('Error al cargar el tablero de reportes. Por favor, intenta de nuevo.');
      },
    });
  }

  /**
   * Refrescar todos los datos
   */
  refrescar(): void {
    console.log('🔄 Refrescando tablero de reportes...');
    this.cargarDatos();
  }

  /**
   * Actualizar fecha de última actualización
   */
  actualizarFecha(): void {
    const ahora = new Date();
    this.fechaActualizacion.set(
      ahora.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  /**
   * Cambiar período de visualización
   */
  cambiarPeriodo(periodo: string): void {
    this.periodoSeleccionado.set(periodo);
    // Aquí podrías recargar datos según el período
    console.log('📅 Período seleccionado:', periodo);
  }

  /**
   * Toggle mostrar gráficos
   */
  toggleGraficos(): void {
    this.mostrarGraficos.set(!this.mostrarGraficos());
  }

  // ============================
  // NAVEGACIÓN
  // ============================

  /**
   * Navegar a productos con stock bajo
   */
  verProductosStockBajo(): void {
    this.router.navigate(['/admin/productos'], {
      queryParams: { filtro: 'stock-bajo' },
    });
  }

  /**
   * Navegar a pedidos pendientes
   */
  verPedidosPendientes(): void {
    this.router.navigate(['/admin/ventas'], {
      queryParams: { estado: 'pendiente' },
    });
  }

  /**
   * Navegar a gestión de clientes
   */
  verClientes(): void {
    this.router.navigate(['/admin/clientes']);
  }

  /**
   * Navegar a gestión de productos
   */
  verProductos(): void {
    this.router.navigate(['/admin/productos']);
  }

  // ============================
  // EXPORTACIÓN
  // ============================

  /**
   * Exportar reporte a Excel
   */
  exportarExcel(): void {
    const fechaInicio = this.obtenerFechaInicio();
    const fechaFin = new Date().toISOString().split('T')[0];

    this.reporteService
      .exportarExcel({
        tipo: 'excel',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Reporte-Laneria-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          console.log('✅ Reporte exportado exitosamente');
          alert('Reporte exportado exitosamente');
        },
        error: (error) => {
          console.error('❌ Error al exportar:', error);
          alert('Error al exportar el reporte');
        },
      });
  }

  /**
   * Exportar reporte a PDF
   */
  exportarPDF(): void {
    const fechaInicio = this.obtenerFechaInicio();
    const fechaFin = new Date().toISOString().split('T')[0];

    this.reporteService
      .exportarPDF({
        tipo: 'pdf',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        incluir_graficos: true,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Reporte-Laneria-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          console.log('✅ Reporte PDF exportado exitosamente');
          alert('Reporte PDF exportado exitosamente');
        },
        error: (error) => {
          console.error('❌ Error al exportar PDF:', error);
          alert('Error al exportar el reporte PDF');
        },
      });
  }

  // ============================
  // MÉTODOS AUXILIARES
  // ============================

  /**
   * Obtener fecha de inicio según período seleccionado
   */
  private obtenerFechaInicio(): string {
    const hoy = new Date();
    let fechaInicio = new Date();

    switch (this.periodoSeleccionado()) {
      case 'hoy':
        fechaInicio = hoy;
        break;
      case 'semana':
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'ano':
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
    }

    return fechaInicio.toISOString().split('T')[0];
  }

  /**
   * Formatear moneda
   */
formatearMoneda(valor: any): string {
  // Validación de seguridad
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'S/ 0.00';
  }
  
  const numero = Number(valor);
  return 'S/ ' + numero.toFixed(2);
}

  /**
   * Obtener valor según período seleccionado
   */
  obtenerValorPeriodo(): number {
    const stats = this.estadisticas();
    if (!stats) return 0;

    switch (this.periodoSeleccionado()) {
      case 'hoy':
        return stats.ventas_hoy;
      case 'mes':
        return stats.ventas_mes;
      case 'ano':
        return stats.ventas_ano;
      default:
        return stats.ventas_mes;
    }
  }

  /**
   * Obtener etiqueta del período
   */
  obtenerEtiquetaPeriodo(): string {
    switch (this.periodoSeleccionado()) {
      case 'hoy':
        return 'Hoy';
      case 'semana':
        return 'Esta Semana';
      case 'mes':
        return 'Este Mes';
      case 'ano':
        return 'Este Año';
      default:
        return 'Este Mes';
    }
  }
}