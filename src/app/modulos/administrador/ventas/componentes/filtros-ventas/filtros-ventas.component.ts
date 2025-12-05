import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosVenta, EstadoVenta, MetodoPago, CanalVenta } from '../../modelos/venta.model';

@Component({
  selector: 'app-filtros-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtros-ventas.component.html',
  styleUrls: ['./filtros-ventas.component.css'],
})
export class FiltrosVentasComponent {
  @Output() filtrosAplicados = new EventEmitter<FiltrosVenta>();

  // Filtros
  readonly fechaDesde = signal<string>('');
  readonly fechaHasta = signal<string>('');
  readonly estado = signal<EstadoVenta | ''>('');
  readonly metodoPago = signal<MetodoPago | ''>('');
  readonly canalVenta = signal<CanalVenta | ''>('');
  readonly busqueda = signal<string>('');

  // Opciones
  readonly estadosDisponibles: EstadoVenta[] = ['Pendiente', 'Completada', 'Cancelada'];
  readonly metodosPago: MetodoPago[] = ['Efectivo', 'Yape', 'Plin', 'Transferencia'];
  readonly canalesVenta: CanalVenta[] = [
    'Tienda física',
    'WhatsApp',
    'Redes sociales',
    'Teléfono',
    'Otro',
  ];

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    const filtros: FiltrosVenta = {};

    if (this.fechaDesde()) filtros.fecha_desde = this.fechaDesde();
    if (this.fechaHasta()) filtros.fecha_hasta = this.fechaHasta();
    if (this.estado()) filtros.estado = this.estado() as EstadoVenta;
    if (this.metodoPago()) filtros.metodo_pago = this.metodoPago() as MetodoPago;
    if (this.canalVenta()) filtros.canal_venta = this.canalVenta() as CanalVenta;
    if (this.busqueda()) filtros.busqueda = this.busqueda();

    this.filtrosAplicados.emit(filtros);
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.estado.set('');
    this.metodoPago.set('');
    this.canalVenta.set('');
    this.busqueda.set('');

    this.filtrosAplicados.emit({});
  }

  /**
   * Aplicar filtro rápido (hoy, esta semana, este mes)
   */
  aplicarFiltroRapido(tipo: 'hoy' | 'semana' | 'mes'): void {
    const hoy = new Date();
    let fechaDesde = '';

    switch (tipo) {
      case 'hoy':
        fechaDesde = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        fechaDesde = inicioSemana.toISOString().split('T')[0];
        break;
      case 'mes':
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        break;
    }

    this.fechaDesde.set(fechaDesde);
    this.fechaHasta.set(hoy.toISOString().split('T')[0]);
    this.aplicarFiltros();
  }
}