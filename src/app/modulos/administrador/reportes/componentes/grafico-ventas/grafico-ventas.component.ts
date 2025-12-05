import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../servicios/reporte.service';
import { FiltrosReporte } from '../../modelos/reporte.model';

@Component({
  selector: 'app-grafico-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grafico-ventas.component.html',
  styleUrls: ['./grafico-ventas.component.css'],
})
export class GraficoVentasComponent implements OnInit {
  // Inyección de dependencias
  private readonly reporteService = inject(ReporteService);

  // Signals del servicio
  ventasPorPeriodo = this.reporteService.ventasPorPeriodo;
  cargando = this.reporteService.cargando;

  // Signals locales
  periodoSeleccionado = signal<'dia' | 'semana' | 'mes'>('mes');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  mostrarDetalle = signal<boolean>(false);

  // ============================
  // CICLO DE VIDA
  // ============================

  ngOnInit(): void {
    this.configurarFechasPorDefecto();
    this.cargarDatos();
  }

  // ============================
  // MÉTODOS PRINCIPALES
  // ============================

  /**
   * Configurar fechas por defecto (último mes)
   */
  configurarFechasPorDefecto(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.fechaFin.set(hoy.toISOString().split('T')[0]);
    this.fechaInicio.set(hace30Dias.toISOString().split('T')[0]);
  }

  /**
   * Cargar datos de ventas
   */
  cargarDatos(): void {
    const filtros: FiltrosReporte = {
      fecha_inicio: this.fechaInicio(),
      fecha_fin: this.fechaFin(),
      agrupar_por: this.periodoSeleccionado(),
    };

    this.reporteService.obtenerVentasPorPeriodo(filtros).subscribe({
      error: (error) => {
        console.error('❌ Error al cargar ventas:', error);
      },
    });
  }

  /**
   * Cambiar período de agrupación
   */
  cambiarPeriodo(periodo: 'dia' | 'semana' | 'mes'): void {
    this.periodoSeleccionado.set(periodo);
    this.cargarDatos();
  }

  /**
   * Aplicar filtro de fechas
   */
  aplicarFiltro(): void {
    this.cargarDatos();
  }

  /**
   * Toggle mostrar detalle
   */
  toggleDetalle(): void {
    this.mostrarDetalle.set(!this.mostrarDetalle());
  }

  // ============================
  // MÉTODOS AUXILIARES
  // ============================

  /**
   * Formatear moneda
   */
  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  }

  /**
   * Obtener altura de barra para el gráfico
   */
  obtenerAlturaBarra(valor: number): number {
    const ventas = this.ventasPorPeriodo();
    if (!ventas || ventas.ventas_por_dia.length === 0) return 0;

    const maxVenta = Math.max(
      ...ventas.ventas_por_dia.map((v) => v.total_ventas)
    );
    return maxVenta > 0 ? (valor / maxVenta) * 100 : 0;
  }

  /**
   * Obtener color de barra según valor
   */
  obtenerColorBarra(valor: number): string {
    const ventas = this.ventasPorPeriodo();
    if (!ventas) return '#8b5cf6';

    const promedio = ventas.ticket_promedio;
    if (valor >= promedio * 1.5) return '#10b981'; // Verde (alto)
    if (valor >= promedio) return '#8b5cf6'; // Morado (normal)
    return '#f59e0b'; // Naranja (bajo)
  }
}