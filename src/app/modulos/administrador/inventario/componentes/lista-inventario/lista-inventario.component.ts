import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../servicios/inventario.service';
import {
  ProductoInventario,
  FiltrosInventario,
  EstadisticasInventario,
  ESTADOS_STOCK
} from '../../modelos/inventario.model';
import { CATEGORIAS } from '../../../productos/modelos/producto.model';

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lista-inventario.component.html',
  styleUrl: './lista-inventario.component.css'
})
export class ListaInventarioComponent implements OnInit {
  
  private inventarioService = inject(InventarioService);

  // 🎯 Signals
  productos = signal<ProductoInventario[]>([]);
  estadisticas = signal<EstadisticasInventario | null>(null);
  cargando = signal(true);
  filtrosActivos = signal<FiltrosInventario>({});
  
  // 🎯 Modals (para futuro)
  mostrarModalAjuste = signal(false);
  mostrarModalHistorial = signal(false);
  productoSeleccionado = signal<ProductoInventario | null>(null);

  // 🎯 Opciones para filtros
  categorias = ['Todas', ...CATEGORIAS];
  estadosStock = ESTADOS_STOCK;
  ordenamiento = [
    { valor: 'nombre', texto: 'Nombre' },
    { valor: 'stock', texto: 'Stock' },
    { valor: 'valor', texto: 'Valor' }
  ];

  // 🎯 Computed (valores calculados)
  valorTotalInventario = computed(() => {
    return this.productos().reduce((total, p) => total + p.valor_total, 0);
  });

  productosStockCritico = computed(() => {
    return this.productos().filter(p => p.estado_stock === 'critico').length;
  });

  productosStockBajo = computed(() => {
    return this.productos().filter(p => p.estado_stock === 'bajo').length;
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * 🔄 Cargar datos del inventario
   */
  cargarDatos(): void {
    this.cargando.set(true);
    
    // Cargar productos
    this.inventarioService.obtenerInventario(this.filtrosActivos()).subscribe({
      next: (productos) => {
        console.log('✅ Productos cargados:', productos);
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar inventario:', error);
        this.cargando.set(false);
      }
    });

    // Cargar estadísticas
    this.inventarioService.obtenerEstadisticas().subscribe({
      next: (stats) => {
        console.log('✅ Estadísticas cargadas:', stats);
        this.estadisticas.set(stats);
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
      }
    });
  }

  /**
   * 🔍 Aplicar filtros
   */
  aplicarFiltros(filtros: FiltrosInventario): void {
    this.filtrosActivos.set(filtros);
    this.cargarDatos();
  }

  /**
   * 🧹 Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtrosActivos.set({});
    this.cargarDatos();
  }

  /**
   * 🔧 Abrir modal de ajuste de stock
   */
  abrirModalAjuste(producto: ProductoInventario): void {
    this.productoSeleccionado.set(producto);
    this.mostrarModalAjuste.set(true);
    console.log('🔧 Modal de ajuste para:', producto.nombre);
  }

  /**
   * 📜 Abrir historial de movimientos
   */
  abrirHistorial(producto: ProductoInventario): void {
    this.productoSeleccionado.set(producto);
    this.mostrarModalHistorial.set(true);
    console.log('📜 Historial para:', producto.nombre);
  }

  /**
   * ❌ Cerrar modales
   */
  cerrarModales(): void {
    this.mostrarModalAjuste.set(false);
    this.mostrarModalHistorial.set(false);
    this.productoSeleccionado.set(null);
  }

  /**
   * ✅ Callback cuando se ajusta el stock
   */
  stockAjustado(): void {
    this.cerrarModales();
    this.cargarDatos();
  }

  /**
   * 🎨 Obtener clase CSS para el badge de stock
   */
  getStockBadgeClass(estado: string): string {
    const clases: Record<string, string> = {
      'critico': 'badge-danger',
      'bajo': 'badge-warning',
      'normal': 'badge-success',
      'exceso': 'badge-info'
    };
    return clases[estado] || 'badge-secondary';
  }

  /**
   * 📝 Obtener texto del estado de stock
   */
  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'critico': 'Crítico',
      'bajo': 'Bajo',
      'normal': 'Normal',
      'exceso': 'Exceso'
    };
    return textos[estado] || estado;
  }
}