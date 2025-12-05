import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosProducto, CATEGORIAS, TIPOS_LANA, COLORES } from '../../modelos/producto.model';

@Component({
  selector: 'app-filtros-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtros-productos.component.html',
  styleUrl: './filtros-productos.component.css'
})
export class FiltrosProductosComponent {
  
  @Input() filtrosActuales: FiltrosProducto = {};
  @Output() filtrosChange = new EventEmitter<FiltrosProducto>();
  @Output() limpiar = new EventEmitter<void>();

  // Opciones de filtros
  categorias = ['Todos', ...CATEGORIAS];
  tiposLana = ['Todos', ...TIPOS_LANA];
  colores = ['Todos', ...COLORES];
  estados = [
    { valor: 'todos', texto: 'Todos' },
    { valor: 'activo', texto: 'Activo' },
    { valor: 'inactivo', texto: 'Inactivo' }
  ];

  // Valores actuales de los filtros
  busqueda = signal('');
  categoriaSeleccionada = signal('Todos');
  tipoLanaSeleccionado = signal('Todos');
  colorSeleccionado = signal('Todos');
  estadoSeleccionado = signal('todos');

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    const filtros: FiltrosProducto = {};

    if (this.busqueda()) {
      filtros.busqueda = this.busqueda();
    }

    if (this.categoriaSeleccionada() !== 'Todos') {
      filtros.categoria = this.categoriaSeleccionada();
    }

    if (this.tipoLanaSeleccionado() !== 'Todos') {
      filtros.tipo_lana = this.tipoLanaSeleccionado();
    }

    if (this.colorSeleccionado() !== 'Todos') {
      filtros.color = this.colorSeleccionado();
    }

    if (this.estadoSeleccionado() !== 'todos') {
      filtros.estado = this.estadoSeleccionado();
    }

    this.filtrosChange.emit(filtros);
  }

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros(): void {
    this.busqueda.set('');
    this.categoriaSeleccionada.set('Todos');
    this.tipoLanaSeleccionado.set('Todos');
    this.colorSeleccionado.set('Todos');
    this.estadoSeleccionado.set('todos');
    this.limpiar.emit();
  }

  /**
   * Verificar si hay filtros activos
   */
  hayFiltrosActivos(): boolean {
    return (
      this.busqueda() !== '' ||
      this.categoriaSeleccionada() !== 'Todos' ||
      this.tipoLanaSeleccionado() !== 'Todos' ||
      this.colorSeleccionado() !== 'Todos' ||
      this.estadoSeleccionado() !== 'todos'
    );
  }
}