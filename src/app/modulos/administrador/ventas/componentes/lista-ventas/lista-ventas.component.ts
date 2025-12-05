import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VentaService } from '../../servicios/venta.service';
import { FiltrosVentasComponent } from '../filtros-ventas/filtros-ventas.component';
import { EstadisticasVentasComponent } from '../estadisticas-ventas/estadisticas-ventas.component';
import { InsigniaEstadoComponent } from '../insignia-estado/insignia-estado.component';
import { FiltrosVenta, Venta, EstadoVenta } from '../../modelos/venta.model';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FiltrosVentasComponent,
    EstadisticasVentasComponent,
    InsigniaEstadoComponent,
  ],
  templateUrl: './lista-ventas.component.html',
  styleUrls: ['./lista-ventas.component.css'],
})
export class ListaVentasComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly router = inject(Router);

  // Signals del servicio
  readonly ventas = this.ventaService.ventas;
  readonly estadisticas = this.ventaService.estadisticas;
  readonly cargando = this.ventaService.cargando;
  readonly totalRegistros = this.ventaService.totalRegistros;
  readonly paginaActual = this.ventaService.paginaActual;
  readonly totalPaginas = this.ventaService.totalPaginas;

  // Estado local
  readonly mostrarFiltros = signal<boolean>(true);
  readonly mostrarEstadisticas = signal<boolean>(true);
  readonly filtrosActuales = signal<FiltrosVenta>({});

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar datos iniciales
   */
  cargarDatos(): void {
    this.ventaService.obtenerVentas(this.filtrosActuales()).subscribe();
    this.ventaService.obtenerEstadisticas().subscribe();
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(filtros: FiltrosVenta): void {
    this.filtrosActuales.set(filtros);
    this.ventaService.obtenerVentas(filtros).subscribe();
  }

  /**
   * Ver detalle de venta
   */
  verDetalle(venta: Venta): void {
    this.router.navigate(['/admin/ventas', venta.venta_id]);
  }

  /**
   * Cambiar estado de venta
   */
  cambiarEstado(venta: Venta, nuevoEstado: EstadoVenta): void {
    const confirmar = confirm(
      `¿Está seguro de cambiar el estado a "${nuevoEstado}"?`
    );

    if (confirmar) {
      this.ventaService
        .cambiarEstado(venta.venta_id, nuevoEstado)
        .subscribe({
          next: (respuesta) => {
            if (respuesta.success) {
              alert(`✓ Estado actualizado a ${nuevoEstado}`);
            }
          },
          error: (error: unknown) => {
            console.error('Error al cambiar estado:', error);
            alert('❌ Error al cambiar el estado');
          },
        });
    }
  }

  /**
   * Generar comprobante PDF
   */
  generarComprobante(venta: Venta): void {
this.ventaService.generarComprobante(venta.venta_id, 'Boleta').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Comprobante-${venta.numero_venta}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: unknown) => {
        console.error('Error al generar comprobante:', error);
        alert('❌ Error al generar el comprobante');
      },
    });
  }

  /**
   * Exportar a Excel
   */
  exportarExcel(): void {
    this.ventaService.exportarExcel(this.filtrosActuales()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ventas-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: unknown) => {
        console.error('Error al exportar:', error);
        alert('❌ Error al exportar a Excel');
      },
    });
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    const filtros = { ...this.filtrosActuales(), pagina };
    this.ventaService.obtenerVentas(filtros).subscribe();
  }

  /**
   * Refrescar datos
   */
  refrescar(): void {
    this.cargarDatos();
  }

  /**
   * Alternar visibilidad de filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros.update((v) => !v);
  }

  /**
   * Alternar visibilidad de estadísticas
   */
  toggleEstadisticas(): void {
    this.mostrarEstadisticas.update((v) => !v);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  /**
   * Obtener icono de método de pago
   */
  obtenerIconoPago(metodo: string): string {
    const iconos: Record<string, string> = {
      Efectivo: '💵',
      Yape: '📱',
      Plin: '💳',
      Transferencia: '🏦',
    };
    return iconos[metodo] || '💰';
  }

  /**
   * Obtener icono de canal
   */
  obtenerIconoCanal(canal: string): string {
    const iconos: Record<string, string> = {
      'Tienda física': '🏪',
      WhatsApp: '💬',
      'Redes sociales': '📲',
      Teléfono: '📞',
      Otro: '➕',
    };
    return iconos[canal] || '🏪';
  }
}