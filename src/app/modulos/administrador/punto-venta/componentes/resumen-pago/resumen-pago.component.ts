import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from '../../servicios/pos.service';
import { MetodoPago, CanalVenta } from '../../modelos/pos.model';

@Component({
  selector: 'app-resumen-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-pago.component.html',
  styleUrls: ['./resumen-pago.component.css'],
})
export class ResumenPagoComponent {
  private readonly posService = inject(PosService);

  // Signals del servicio
  readonly carrito = this.posService.carrito;
  readonly clienteSeleccionado = this.posService.clienteSeleccionado;
  readonly metodoPago = this.posService.metodoPago;
  readonly canalVenta = this.posService.canalVenta;
  readonly procesandoVenta = this.posService.procesandoVenta;

  // Estados locales
  readonly mostrarMetodos = signal(false);
  readonly mostrarCanales = signal(false);
  readonly observaciones = signal('');

  // Opciones disponibles
  readonly metodosPago: MetodoPago[] = [
    'Efectivo',
    'Yape',
    'Plin',
    'Transferencia',
  ];

  readonly canalesVenta: CanalVenta[] = [
    'Tienda física',
    'WhatsApp',
    'Redes sociales',
    'Teléfono',
    'Otro',
  ];

  // Iconos para métodos de pago
  readonly iconosPago: Record<MetodoPago, string> = {
    Efectivo: '💵',
    Yape: '📱',
    Plin: '💳',
    Transferencia: '🏦',
  };

  // Iconos para canales de venta
  readonly iconosCanal: Record<CanalVenta, string> = {
    'Tienda física': '🏪',
    WhatsApp: '💬',
    'Redes sociales': '📲',
    Teléfono: '📞',
    Otro: '➕',
  };

  /**
   * Seleccionar método de pago
   */
  seleccionarMetodo(metodo: MetodoPago): void {
    this.posService.seleccionarMetodoPago(metodo);
    this.mostrarMetodos.set(false);
  }

  /**
   * Seleccionar canal de venta
   */
  seleccionarCanal(canal: CanalVenta): void {
    this.posService.seleccionarCanalVenta(canal);
    this.mostrarCanales.set(false);
  }

  /**
   * Actualizar observaciones
   */
  actualizarObservaciones(event: Event): void {
    const valor = (event.target as HTMLTextAreaElement).value;
    this.observaciones.set(valor);
    this.posService.agregarObservaciones(valor);
  }

  /**
   * Procesar venta
   */
  procesarVenta(): void {
    // Validaciones
    if (this.carrito().items.length === 0) {
      alert('⚠️ El carrito está vacío');
      return;
    }

    if (!this.clienteSeleccionado()) {
      alert('⚠️ Debe seleccionar un cliente');
      return;
    }

    if (!this.metodoPago()) {
      alert('⚠️ Debe seleccionar un método de pago');
      return;
    }

    // Procesar
    this.posService.procesarVenta().subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          console.log('✅ Venta procesada:', respuesta);
          // El componente principal maneja la notificación
        }
      },
      error: (error) => {
        console.error('❌ Error al procesar venta:', error);
        alert('Error al procesar la venta. Intente nuevamente.');
      },
    });
  }

  /**
   * Toggle dropdown métodos
   */
  toggleMetodos(): void {
    this.mostrarMetodos.update((v) => !v);
    this.mostrarCanales.set(false);
  }

  /**
   * Toggle dropdown canales
   */
  toggleCanales(): void {
    this.mostrarCanales.update((v) => !v);
    this.mostrarMetodos.set(false);
  }
}