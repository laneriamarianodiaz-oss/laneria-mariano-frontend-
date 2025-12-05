import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../servicios/pos.service';

@Component({
  selector: 'app-items-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items-carrito.component.html',
  styleUrls: ['./items-carrito.component.css'],
})
export class ItemsCarritoComponent {
  private readonly posService = inject(PosService);

  // Signals del servicio
  readonly carrito = this.posService.carrito;

  /**
   * Actualizar cantidad de un item
   */
  actualizarCantidad(index: number, event: Event): void {
    const cantidad = parseInt((event.target as HTMLInputElement).value);
    if (cantidad > 0) {
      this.posService.actualizarCantidad(index, cantidad);
    }
  }

  /**
   * Incrementar cantidad
   */
  incrementarCantidad(index: number): void {
    const item = this.carrito().items[index];
    if (item) {
      this.posService.actualizarCantidad(index, item.cantidad + 1);
    }
  }

  /**
   * Decrementar cantidad
   */
  decrementarCantidad(index: number): void {
    const item = this.carrito().items[index];
    if (item && item.cantidad > 1) {
      this.posService.actualizarCantidad(index, item.cantidad - 1);
    }
  }

  /**
   * Eliminar item del carrito
   */
  eliminarItem(index: number): void {
    if (confirm('¿Eliminar este producto del carrito?')) {
      this.posService.eliminarItem(index);
    }
  }
}