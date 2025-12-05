import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../../../compartido/modelos/pedido.modelo';
import { PedidoService } from '../../servicios/pedido.service';
import { SeguimientoPedidoComponent } from '../seguimiento-pedido/seguimiento-pedido.component'; // ← AGREGAR

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [
    CommonModule,
    SeguimientoPedidoComponent  // ← AGREGAR
  ],
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.scss']
})
export class DetallePedidoComponent {
  @Input() pedido: Pedido | null = null;
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  private pedidoService = inject(PedidoService);

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }

  /**
   * Obtener clase CSS según estado
   */
  getEstadoClase(estado: string | undefined): string {
    if (!estado) return 'badge-secondary';
    
    const color = this.pedidoService.obtenerColorEstado(estado);
    return `badge-${color}`;
  }

  /**
   * Obtener icono según estado
   */
  getEstadoIcono(estado: string | undefined): string {
    if (!estado) return '📋';
    return this.pedidoService.obtenerIconoEstado(estado);
  }

  /**
   * Obtener texto de estado
   */
  getEstadoTexto(estado: string | undefined): string {
    return estado || 'Sin estado';
  }

  /**
   * Obtener progreso del pedido
   */
  getProgreso(estado: string | undefined): number {
    if (!estado) return 0;
    return this.pedidoService.obtenerProgresoPedido(estado);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calcular total de productos
   */
  get totalProductos(): number {
    if (!this.pedido?.productos) return 0;
    return this.pedido.productos.reduce((total, p) => total + (p.cantidad || 0), 0);
  }
}