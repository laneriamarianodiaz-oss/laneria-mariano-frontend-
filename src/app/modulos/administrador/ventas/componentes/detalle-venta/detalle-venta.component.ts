import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from '../../servicios/venta.service';
import { InsigniaEstadoComponent } from '../insignia-estado/insignia-estado.component';
import { Venta, EstadoVenta } from '../../modelos/venta.model';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [CommonModule, InsigniaEstadoComponent],
  templateUrl: './detalle-venta.component.html',
  styleUrls: ['./detalle-venta.component.css'],
})
export class DetalleVentaComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly venta = signal<Venta | null>(null);
  readonly cargando = signal<boolean>(true);

  ngOnInit(): void {
    const ventaId = this.route.snapshot.params['id'];
    if (ventaId) {
      this.cargarVenta(Number(ventaId));
    }
  }

  /**
   * Cargar venta
   */
  cargarVenta(ventaId: number): void {
    this.cargando.set(true);
    this.ventaService.obtenerVenta(ventaId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.venta.set(respuesta.data);
        }
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar venta:', error);
        this.cargando.set(false);
      },
    });
  }

  /**
   * Cambiar estado
   */
  cambiarEstado(nuevoEstado: EstadoVenta): void {
    const ventaActual = this.venta();
    if (!ventaActual) return;

    const confirmar = confirm(
      `¿Está seguro de cambiar el estado a "${nuevoEstado}"?`
    );

    if (confirmar) {
      this.ventaService
        .cambiarEstado(ventaActual.venta_id, nuevoEstado)
        .subscribe({
          next: (respuesta) => {
            if (respuesta.success) {
              this.venta.set(respuesta.data);
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
   * Generar comprobante
   */
  generarComprobante(): void {
    const ventaActual = this.venta();
    if (!ventaActual) return;

    this.ventaService.generarComprobante(ventaActual.venta_id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Comprobante-${ventaActual.numero_venta}.pdf`;
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
   * Volver a la lista
   */
  volver(): void {
    this.router.navigate(['/admin/ventas']);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
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