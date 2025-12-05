import { Component, EventEmitter, Input, Output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../servicios/inventario.service';
import { ProductoInventario, AjusteStock, TIPOS_MOVIMIENTO } from '../../modelos/inventario.model';

@Component({
  selector: 'app-modal-ajuste-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-ajuste-stock.component.html',
  styleUrl: './modal-ajuste-stock.component.css'
})
export class ModalAjusteStockComponent implements OnInit {
  
  @Input() producto!: ProductoInventario;
  @Output() cerrar = new EventEmitter<void>();
  @Output() stockAjustado = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);

  // Opciones
  tiposMovimiento = TIPOS_MOVIMIENTO;

  // Formulario
  tipoMovimiento = signal<string>('entrada');
  cantidad = signal<number>(0);
  motivo = signal<string>('');
  referencia = signal<string>('');

  // Estados
  guardando = signal(false);
  nuevoStock = signal<number>(0);

  ngOnInit(): void {
    this.nuevoStock.set(this.producto.stock);
  }

  /**
   * Calcular nuevo stock al cambiar cantidad o tipo
   */
  calcularNuevoStock(): void {
    const cantidadActual = this.cantidad();
    const stockActual = this.producto.stock;

    if (this.tipoMovimiento() === 'entrada') {
      this.nuevoStock.set(stockActual + cantidadActual);
    } else if (this.tipoMovimiento() === 'salida') {
      this.nuevoStock.set(Math.max(0, stockActual - cantidadActual));
    } else if (this.tipoMovimiento() === 'ajuste') {
      this.nuevoStock.set(cantidadActual);
    } else if (this.tipoMovimiento() === 'devolucion') {
      this.nuevoStock.set(stockActual + cantidadActual);
    }
  }

  /**
   * Validar formulario
   */
  validarFormulario(): boolean {
    if (!this.tipoMovimiento()) {
      alert('Seleccione el tipo de movimiento');
      return false;
    }

    if (this.cantidad() <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return false;
    }

    if (this.tipoMovimiento() === 'salida' && this.cantidad() > this.producto.stock) {
      alert('No hay suficiente stock disponible');
      return false;
    }

    if (!this.motivo()) {
      alert('Ingrese el motivo del ajuste');
      return false;
    }

    return true;
  }

  /**
   * Guardar ajuste
   */
  guardarAjuste(): void {
    if (!this.validarFormulario()) return;

    this.guardando.set(true);

    const ajuste: AjusteStock = {
      producto_id: this.producto.id,
      tipo_movimiento: this.tipoMovimiento() as any,
      cantidad: this.cantidad(),
      motivo: this.motivo(),
      referencia: this.referencia() || undefined
    };

    this.inventarioService.ajustarStock(ajuste).subscribe({
      next: () => {
        alert('Stock ajustado correctamente');
        this.stockAjustado.emit();
        this.guardando.set(false);
      },
      error: (error) => {
        console.error('Error al ajustar stock:', error);
        alert('Error al ajustar el stock. Por favor intente nuevamente.');
        this.guardando.set(false);
      }
    });
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    if (this.guardando()) return;
    this.cerrar.emit();
  }

  /**
   * Obtener info del tipo de movimiento
   */
  getTipoMovimientoInfo(tipo: string) {
    return this.tiposMovimiento.find(t => t.valor === tipo);
  }

  /**
   * Actualizar tipo de movimiento
   */
  actualizarTipoMovimiento(valor: string): void {
    this.tipoMovimiento.set(valor);
    this.calcularNuevoStock();
  }

  /**
   * Actualizar cantidad
   */
  actualizarCantidad(valor: number): void {
    this.cantidad.set(valor);
    this.calcularNuevoStock();
  }
}