import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../servicios/reporte.service';
import { FiltrosReporte } from '../../modelos/reporte.model';

@Component({
  selector: 'app-productos-vendidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-vendidos.component.html',
  styleUrls: ['./productos-vendidos.component.css'],
})
export class ProductosVendidosComponent implements OnInit {
  // Inyección de dependencias
  private readonly reporteService = inject(ReporteService);

  // Signals del servicio
  productosMasVendidos = this.reporteService.productosMasVendidos;
  cargando = signal<boolean>(false);

  // Signals locales
  topSeleccionado = signal<number>(10);
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  mostrarTodos = signal<boolean>(false);

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
   * Cargar datos de productos más vendidos
   */
  cargarDatos(): void {
    this.cargando.set(true);

    const filtros: FiltrosReporte = {
      fecha_inicio: this.fechaInicio(),
      fecha_fin: this.fechaFin(),
      top: this.topSeleccionado(),
    };

    this.reporteService.obtenerProductosMasVendidos(filtros).subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.cargando.set(false);
      },
    });
  }

  /**
   * Cambiar cantidad de top productos
   */
  cambiarTop(cantidad: number): void {
    this.topSeleccionado.set(cantidad);
    this.cargarDatos();
  }

  /**
   * Aplicar filtro de fechas
   */
  aplicarFiltro(): void {
    this.cargarDatos();
  }

  /**
   * Toggle mostrar todos
   */
  toggleMostrarTodos(): void {
    this.mostrarTodos.set(!this.mostrarTodos());
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
   * Obtener productos a mostrar
   */
  obtenerProductosMostrar() {
    const productos = this.productosMasVendidos();
    if (this.mostrarTodos()) {
      return productos;
    }
    return productos.slice(0, 5);
  }

  /**
   * Obtener porcentaje de barra
   */
  obtenerPorcentajeBarra(cantidad: number): number {
    const productos = this.productosMasVendidos();
    if (productos.length === 0) return 0;

    const maxCantidad = Math.max(...productos.map((p) => p.cantidad_vendida));
    return maxCantidad > 0 ? (cantidad / maxCantidad) * 100 : 0;
  }

  /**
   * Obtener medalla según posición
   */
  obtenerMedalla(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}°`;
  }
}