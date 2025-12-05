import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../modelos/producto.modelo';

@Component({
  selector: 'app-detalle-producto-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-producto-modal.component.html',
  styleUrls: ['./detalle-producto-modal.component.scss']
})
export class DetalleProductoModalComponent {
  @Input() producto: Producto | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() agregarCarrito = new EventEmitter<Producto>();

  cerrarModal(): void {
    this.cerrar.emit();
  }

  agregar(): void {
    if (this.producto) {
      this.agregarCarrito.emit(this.producto);
    }
  }
}