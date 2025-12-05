import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PasoSeguimiento {
  estado: string;
  titulo: string;
  descripcion: string;
  icono: string;
  completado: boolean;
  activo: boolean;
  fecha?: string;
}

@Component({
  selector: 'app-seguimiento-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-pedido.component.html',
  styleUrls: ['./seguimiento-pedido.component.scss']
})
export class SeguimientoPedidoComponent {
  @Input() estadoActual: string = 'Pendiente';
  @Input() observaciones?: string;
  @Input() fechaPedido?: string;

  /**
   * Obtener pasos del seguimiento según el estado actual
   */
  get pasosSeguimiento(): PasoSeguimiento[] {
    const ordenEstados = [
      'Pendiente',
      'Confirmado',
      'En Proceso',
      'Enviado',
      'Entregado',
      'Completado'
    ];

    const estadoIndex = ordenEstados.indexOf(this.estadoActual);
    const cancelado = this.estadoActual === 'Cancelado';

    return [
      {
        estado: 'Pendiente',
        titulo: 'Pedido Recibido',
        descripcion: 'Tu pedido ha sido registrado',
        icono: '📋',
        completado: estadoIndex >= 0 && !cancelado,
        activo: this.estadoActual === 'Pendiente',
        fecha: this.estadoActual === 'Pendiente' ? this.fechaPedido : undefined
      },
      {
        estado: 'Confirmado',
        titulo: 'Confirmado',
        descripcion: 'Tu pedido ha sido confirmado',
        icono: '✓',
        completado: estadoIndex >= 1 && !cancelado,
        activo: this.estadoActual === 'Confirmado'
      },
      {
        estado: 'En Proceso',
        titulo: 'En Preparación',
        descripcion: 'Estamos preparando tu pedido',
        icono: '📦',
        completado: estadoIndex >= 2 && !cancelado,
        activo: this.estadoActual === 'En Proceso'
      },
      {
        estado: 'Enviado',
        titulo: 'En Camino',
        descripcion: 'Tu pedido está en camino',
        icono: '🚚',
        completado: estadoIndex >= 3 && !cancelado,
        activo: this.estadoActual === 'Enviado'
      },
      {
        estado: 'Entregado',
        titulo: 'Entregado',
        descripcion: 'Tu pedido ha sido entregado',
        icono: '🎉',
        completado: estadoIndex >= 4 && !cancelado,
        activo: this.estadoActual === 'Entregado'
      },
      {
        estado: 'Completado',
        titulo: 'Completado',
        descripcion: '¡Gracias por tu compra!',
        icono: '✅',
        completado: estadoIndex >= 5 && !cancelado,
        activo: this.estadoActual === 'Completado'
      }
    ];
  }

  /**
   * Obtener progreso en porcentaje
   */
  get progresoPorcentaje(): number {
    const ordenEstados = [
      'Pendiente',
      'Confirmado',
      'En Proceso',
      'Enviado',
      'Entregado',
      'Completado'
    ];

    const estadoIndex = ordenEstados.indexOf(this.estadoActual);
    
    if (this.estadoActual === 'Cancelado') return 0;
    if (estadoIndex === -1) return 0;
    
    return Math.round(((estadoIndex + 1) / ordenEstados.length) * 100);
  }

  /**
   * Verificar si está cancelado
   */
  get estaCancelado(): boolean {
    return this.estadoActual === 'Cancelado';
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}