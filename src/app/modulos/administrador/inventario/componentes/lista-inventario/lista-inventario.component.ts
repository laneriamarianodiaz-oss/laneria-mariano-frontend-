import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { ModalAjusteStockComponent } from '../modal-ajuste-stock/modal-ajuste-stock.component'; // ⬅️ COMENTADO
// import { HistorialStockComponent } from '../historial-stock/historial-stock.component'; // ⬅️ COMENTADO
// import { PanelAlertasStockComponent } from '../panel-alertas-stock/panel-alertas-stock.component'; // ⬅️ COMENTADO
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
    FormsModule,
    // ModalAjusteStockComponent, // ⬅️ COMENTADO
    // HistorialStockComponent, // ⬅️ COMENTADO
    // PanelAlertasStockComponent // ⬅️ COMENTADO
  ],
  templateUrl: './lista-inventario.component.html',
  styleUrl: './lista-inventario.component.css'
})
export class ListaInventarioComponent implements OnInit {
  
  private inventarioService = inject(InventarioService);

  // Signals
  productos = signal<ProductoInventario[]>([]);
  estadisticas = signal<EstadisticasInventario | null>(null);
  cargando = signal(true);
  filtrosActivos = signal<FiltrosInventario>({});
  
  // Modals
  mostrarModalAjuste = signal(false);
  mostrarModalHistorial = signal(false);
  productoSeleccionado = signal<ProductoInventario | null>(null);

  // Opciones
  categorias = ['Todas', ...CATEGORIAS];
  estadosStock = ESTADOS_STOCK;
  ordenamiento = [
    { valor: 'nombre', texto: 'Nombre' },
    { valor: 'stock', texto: 'Stock' },
    { valor: 'valor', texto: 'Valor' }
  ];

  // Computed
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

cargarDatos(): void {
  this.cargando.set(true);
  
  this.inventarioService.obtenerInventario(this.filtrosActivos()).subscribe({
    next: (productos) => {
      console.log('✅ Productos cargados:', productos);
      this.productos.set(productos);
      this.cargando.set(false);
    },
    error: (error) => {
      console.error('Error al cargar inventario:', error);
      this.cargarDatosPrueba();
    }
  });

  // COMENTAR TEMPORALMENTE LAS ESTADÍSTICAS
  /*
  this.inventarioService.obtenerEstadisticas().subscribe({
    next: (stats) => {
      this.estadisticas.set(stats);
    },
    error: () => {
      this.estadisticas.set({
        total_productos: 156,
        valor_total_inventario: 45678.50,
        productos_stock_critico: 3,
        productos_stock_bajo: 8,
        productos_stock_normal: 135,
        productos_exceso: 10,
        movimientos_hoy: 15,
        movimientos_mes: 342
      });
    }
  });
  */
}

  aplicarFiltros(filtros: FiltrosInventario): void {
    this.filtrosActivos.set(filtros);
    this.cargarDatos();
  }

  limpiarFiltros(): void {
    this.filtrosActivos.set({});
    this.cargarDatos();
  }

  abrirModalAjuste(producto: ProductoInventario): void {
    this.productoSeleccionado.set(producto);
    this.mostrarModalAjuste.set(true);
  }

  abrirHistorial(producto: ProductoInventario): void {
    this.productoSeleccionado.set(producto);
    this.mostrarModalHistorial.set(true);
  }

  cerrarModales(): void {
    this.mostrarModalAjuste.set(false);
    this.mostrarModalHistorial.set(false);
    this.productoSeleccionado.set(null);
  }

  stockAjustado(): void {
    this.cerrarModales();
    this.cargarDatos();
  }

  getStockBadgeClass(estado: string): string {
    const clases: Record<string, string> = {
      'critico': 'badge-danger',
      'bajo': 'badge-warning',
      'normal': 'badge-success',
      'exceso': 'badge-info'
    };
    return clases[estado] || 'badge-secondary';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'critico': 'Crítico',
      'bajo': 'Bajo',
      'normal': 'Normal',
      'exceso': 'Exceso'
    };
    return textos[estado] || estado;
  }

  private cargarDatosPrueba(): void {
    const productosPrueba: ProductoInventario[] = [
      {
        id: 1,
        codigo_lana: 'AMG-005',
        nombre: 'Oso abrazo',
        categoria: 'Peluches',
        tipo_lana: 'Perlita domino',
        color: 'Blanco',
        stock: 6,
        stock_minimo: 10,
        stock_maximo: 50,
        precio_unitario: 15.00,
        valor_total: 90.00,
        estado_stock: 'bajo'
      },
      {
        id: 2,
        codigo_lana: 'KIT-024',
        nombre: 'Tijeras de tejidos',
        categoria: 'Kit de costura',
        tipo_lana: 'Silvia Clásica',
        color: 'Dorado',
        stock: 15,
        stock_minimo: 10,
        stock_maximo: 40,
        precio_unitario: 52.00,
        valor_total: 780.00,
        estado_stock: 'normal'
      },
      {
        id: 3,
        codigo_lana: 'PDO-001',
        nombre: 'Gorra nórdica',
        categoria: 'Ropa',
        tipo_lana: 'Perlita domino',
        color: 'Piel',
        stock: 5,
        stock_minimo: 10,
        stock_maximo: 30,
        precio_unitario: 45.00,
        valor_total: 225.00,
        estado_stock: 'critico'
      },
      {
        id: 4,
        codigo_lana: 'AMG-012',
        nombre: 'Mini plantas',
        categoria: 'Souvenirs',
        tipo_lana: 'Silvia Clásica',
        color: 'Verde',
        stock: 32,
        stock_minimo: 15,
        stock_maximo: 50,
        precio_unitario: 31.00,
        valor_total: 992.00,
        estado_stock: 'normal'
      },
      {
        id: 5,
        codigo_lana: 'PDO-015',
        nombre: 'Merinos premium',
        categoria: 'Lanas',
        tipo_lana: 'Silvia Clásica',
        color: 'Rosa',
        stock: 2,
        stock_minimo: 20,
        stock_maximo: 100,
        precio_unitario: 19.90,
        valor_total: 39.80,
        estado_stock: 'critico'
      }
    ];

    this.productos.set(productosPrueba);
    this.cargando.set(false);
  }
}