import { Component, EventEmitter, Input, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../servicios/inventario.service';
import { MovimientoStock, TIPOS_MOVIMIENTO } from '../../modelos/inventario.model';

@Component({
  selector: 'app-historial-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-stock.component.html',
  styleUrl: './historial-stock.component.css'
})
export class HistorialStockComponent implements OnInit {
  
  @Input() productoId!: number;
  @Input() productoNombre!: string;
  @Output() cerrar = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);

  // Signals
  movimientos = signal<MovimientoStock[]>([]);
  cargando = signal(true);

  // Opciones
  tiposMovimiento = TIPOS_MOVIMIENTO;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  /**
   * Cargar historial de movimientos
   */
  cargarHistorial(): void {
    this.cargando.set(true);

    this.inventarioService.obtenerHistorialMovimientos(this.productoId).subscribe({
      next: (movimientos) => {
        this.movimientos.set(movimientos);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.cargarDatosPrueba();
      }
    });
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }

  /**
   * Obtener info del tipo de movimiento
   */
  getTipoMovimientoInfo(tipo: string) {
    return this.tiposMovimiento.find(t => t.valor === tipo);
  }

  /**
   * Obtener clase de badge según tipo
   */
  getBadgeClass(tipo: string): string {
    const info = this.getTipoMovimientoInfo(tipo);
    return info?.valor || '';
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Datos de prueba
   */
  private cargarDatosPrueba(): void {
    const movimientosPrueba: MovimientoStock[] = [
      {
        id: 1,
        producto_id: this.productoId,
        producto_nombre: this.productoNombre,
        producto_codigo: 'AMG-005',
        tipo_movimiento: 'entrada',
        cantidad: 20,
        stock_anterior: 6,
        stock_nuevo: 26,
        motivo: 'Compra a proveedor',
        usuario_nombre: 'Juan Pérez',
        fecha: '2024-11-15T10:30:00',
        referencia: 'Factura #1234'
      },
      {
        id: 2,
        producto_id: this.productoId,
        producto_nombre: this.productoNombre,
        producto_codigo: 'AMG-005',
        tipo_movimiento: 'salida',
        cantidad: 5,
        stock_anterior: 26,
        stock_nuevo: 21,
        motivo: 'Venta al cliente',
        usuario_nombre: 'María López',
        fecha: '2024-11-14T15:20:00',
        referencia: 'Venta #567'
      },
      {
        id: 3,
        producto_id: this.productoId,
        producto_nombre: this.productoNombre,
        producto_codigo: 'AMG-005',
        tipo_movimiento: 'ajuste',
        cantidad: 25,
        stock_anterior: 21,
        stock_nuevo: 25,
        motivo: 'Corrección de inventario',
        usuario_nombre: 'Admin',
        fecha: '2024-11-13T09:00:00'
      },
      {
        id: 4,
        producto_id: this.productoId,
        producto_nombre: this.productoNombre,
        producto_codigo: 'AMG-005',
        tipo_movimiento: 'devolucion',
        cantidad: 2,
        stock_anterior: 25,
        stock_nuevo: 27,
        motivo: 'Devolución de cliente',
        usuario_nombre: 'Carlos Ruiz',
        fecha: '2024-11-12T14:45:00',
        referencia: 'Dev #89'
      },
      {
        id: 5,
        producto_id: this.productoId,
        producto_nombre: this.productoNombre,
        producto_codigo: 'AMG-005',
        tipo_movimiento: 'entrada',
        cantidad: 15,
        stock_anterior: 27,
        stock_nuevo: 42,
        motivo: 'Reposición de inventario',
        usuario_nombre: 'Ana Torres',
        fecha: '2024-11-10T11:00:00',
        referencia: 'OC #456'
      }
    ];

    this.movimientos.set(movimientosPrueba);
    this.cargando.set(false);
  }
}