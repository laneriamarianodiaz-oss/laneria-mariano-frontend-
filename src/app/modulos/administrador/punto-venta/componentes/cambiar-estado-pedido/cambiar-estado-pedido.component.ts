// ============================================
// NUEVO DISEÑO: cambiar-estado-pedido.component.ts
// ============================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OpcionEstado {
  valor: string;
  texto: string;
  icono: string;
  color: string;
  descripcion: string; // ⬅️ NUEVO: Descripción del estado
}

@Component({
  selector: 'app-cambiar-estado-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-estado-pedido.component.html',
  styleUrls: ['./cambiar-estado-pedido.component.scss']
})
export class CambiarEstadoPedidoComponent {
  @Input() estadoActual: string = 'Pendiente';
  @Input() pedidoId?: number;
  @Output() estadoCambiado = new EventEmitter<{ nuevoEstado: string, observaciones: string }>();

  estadoSeleccionado: string = '';
  observaciones: string = '';
  mostrarModal: boolean = false;

  // Estados disponibles y sus transiciones
  private transicionesValidas: { [key: string]: string[] } = {
    'Pendiente': ['Confirmado', 'Cancelado'],
    'Confirmado': ['En Proceso', 'Cancelado'],
    'En Proceso': ['Enviado', 'Cancelado'],
    'Enviado': ['Entregado'],
    'Entregado': ['Completado'],
    'Completado': [],
    'Cancelado': []
  };

  /**
   * Obtener estados disponibles según el estado actual
   */
  get estadosDisponibles(): OpcionEstado[] {
    const estadosValidos = this.transicionesValidas[this.estadoActual] || [];
    
    const todosEstados: OpcionEstado[] = [
      { 
        valor: 'Pendiente', 
        texto: 'Pendiente', 
        icono: '⏳', 
        color: 'warning',
        descripcion: 'El pedido está esperando confirmación'
      },
      { 
        valor: 'Confirmado', 
        texto: 'Confirmado', 
        icono: '✓', 
        color: 'info',
        descripcion: 'El pedido fue confirmado y está listo para procesarse'
      },
      { 
        valor: 'En Proceso', 
        texto: 'En Preparación', // ⬅️ CAMBIO: Mejor nombre
        icono: '🔄', 
        color: 'primary',
        descripcion: 'Estamos preparando tu pedido'
      },
      { 
        valor: 'Enviado', 
        texto: 'En Camino', // ⬅️ CAMBIO: Mejor nombre
        icono: '🚚', 
        color: 'primary',
        descripcion: 'Tu pedido está en camino'
      },
      { 
        valor: 'Entregado', 
        texto: 'Entregado', 
        icono: '📦', 
        color: 'success',
        descripcion: 'El pedido fue entregado al cliente'
      },
      { 
        valor: 'Completado', 
        texto: 'Completado', 
        icono: '✅', 
        color: 'success',
        descripcion: 'Pedido finalizado exitosamente'
      },
      { 
        valor: 'Cancelado', 
        texto: 'Cancelado', 
        icono: '❌', 
        color: 'danger',
        descripcion: 'El pedido fue cancelado'
      }
    ];

    return todosEstados.filter(e => estadosValidos.includes(e.valor));
  }

  /**
   * Obtener información del estado actual
   */
  get estadoActualInfo(): OpcionEstado {
    const estados: { [key: string]: OpcionEstado } = {
      'Pendiente': { 
        valor: 'Pendiente', 
        texto: 'Pendiente', 
        icono: '⏳', 
        color: 'warning',
        descripcion: 'Esperando confirmación'
      },
      'Confirmado': { 
        valor: 'Confirmado', 
        texto: 'Confirmado', 
        icono: '✓', 
        color: 'info',
        descripcion: 'Pedido confirmado'
      },
      'En Proceso': { 
        valor: 'En Proceso', 
        texto: 'En Preparación', 
        icono: '🔄', 
        color: 'primary',
        descripcion: 'Preparando pedido'
      },
      'Enviado': { 
        valor: 'Enviado', 
        texto: 'En Camino', 
        icono: '🚚', 
        color: 'primary',
        descripcion: 'Pedido en camino'
      },
      'Entregado': { 
        valor: 'Entregado', 
        texto: 'Entregado', 
        icono: '📦', 
        color: 'success',
        descripcion: 'Pedido entregado'
      },
      'Completado': { 
        valor: 'Completado', 
        texto: 'Completado', 
        icono: '✅', 
        color: 'success',
        descripcion: 'Finalizado'
      },
      'Cancelado': { 
        valor: 'Cancelado', 
        texto: 'Cancelado', 
        icono: '❌', 
        color: 'danger',
        descripcion: 'Pedido cancelado'
      }
    };

    return estados[this.estadoActual] || estados['Pendiente'];
  }

  /**
   * Verificar si el pedido puede cambiar de estado
   */
  get puedeActualizar(): boolean {
    return this.estadosDisponibles.length > 0;
  }

  /**
   * Obtener información del estado seleccionado
   */
  obtenerInfoEstadoSeleccionado(): OpcionEstado | undefined {
    return this.estadosDisponibles.find(e => e.valor === this.estadoSeleccionado);
  }

  /**
   * Abrir modal para cambiar estado
   */
  abrirModal(nuevoEstado: string): void {
    this.estadoSeleccionado = nuevoEstado;
    this.observaciones = '';
    this.mostrarModal = true;
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.estadoSeleccionado = '';
    this.observaciones = '';
  }

  /**
   * Confirmar cambio de estado
   */
  confirmarCambio(): void {
    if (!this.estadoSeleccionado) return;

    // Validar observaciones para cancelación
    if (this.estadoSeleccionado === 'Cancelado' && !this.observaciones.trim()) {
      alert('⚠️ Debes proporcionar un motivo para cancelar el pedido');
      return;
    }

    this.estadoCambiado.emit({
      nuevoEstado: this.estadoSeleccionado,
      observaciones: this.observaciones
    });

    this.cerrarModal();
  }

  /**
   * Obtener clase CSS del badge
   */
  getBadgeClass(color: string): string {
    return `badge-${color}`;
  }

  /**
   * Obtener clase CSS de la card
   */
  getCardClass(color: string): string {
    return `estado-card-${color}`;
  }
}