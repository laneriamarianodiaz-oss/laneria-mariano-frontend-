import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { ItemCarrito } from '../../../../compartido/modelos/carrito.modelo';

interface ItemCarritoExtendido extends ItemCarrito {
  seleccionado: boolean;
}

@Component({
  selector: 'app-detalle-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-carrito.component.html',
  styleUrl: './detalle-carrito.component.scss'
})
export class DetalleCarritoComponent implements OnInit {
  items: ItemCarritoExtendido[] = [];
  cantidadItems = 0;
  totalArticulos = 0;
  cantidadItemsSeleccionados = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.carritoService.carrito$.subscribe(carrito => {
      console.log('🛒 Carrito recibido:', carrito); // ← DEBUG
      this.items = carrito.items.map(item => {
        console.log('📦 Item del carrito:', item); // ← DEBUG
        return {
          ...item,
          seleccionado: true
        };
      });
      this.cantidadItems = carrito.items.length;
      this.calcularTotal();
    });
  }

  toggleSeleccion(item: ItemCarritoExtendido): void {
    item.seleccionado = !item.seleccionado;
    this.calcularTotal();
  }

  aumentarCantidad(item: ItemCarritoExtendido): void {
    // ✅ Usar producto_id en lugar de id
    const productoId = item.producto.producto_id || item.producto.id;
    if (productoId) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad + 1);
    }
  }

  disminuirCantidad(item: ItemCarritoExtendido): void {
    if (item.cantidad > 1) {
      // ✅ Usar producto_id en lugar de id
      const productoId = item.producto.producto_id || item.producto.id;
      if (productoId) {
        this.carritoService.actualizarCantidad(productoId, item.cantidad - 1);
      }
    }
  }

  eliminarItem(item: ItemCarritoExtendido): void {
    // ✅ Usar producto_id en lugar de id
    const productoId = item.producto.producto_id || item.producto.id;
    if (productoId) {
      this.carritoService.eliminarProducto(productoId);
    }
  }

  limpiarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.carritoService.limpiarCarrito();
    }
  }

  calcularTotal(): void {
    this.totalArticulos = this.items
      .filter(item => item.seleccionado)
      .reduce((sum, item) => sum + ((item.producto.precio_unitario || item.producto.precio_producto || 0) * item.cantidad), 0);
    
    this.cantidadItemsSeleccionados = this.items
      .filter(item => item.seleccionado)
      .reduce((sum, item) => sum + item.cantidad, 0);
  }

  todoSeleccionado(): boolean {
    return this.items.length > 0 && this.items.every(item => item.seleccionado);
  }

  seleccionarTodo(event: any): void {
    const seleccionar = event.target.checked;
    this.items.forEach(item => item.seleccionado = seleccionar);
    this.calcularTotal();
  }
}