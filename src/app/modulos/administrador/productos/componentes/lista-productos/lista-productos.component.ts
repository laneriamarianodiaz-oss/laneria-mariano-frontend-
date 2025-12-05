import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagenUrlPipe } from '../../../../../compartido/pipes/imagen-url.pipe';
import { FiltrosProductosComponent } from '../filtros-productos/filtros-productos.component';
import { FormularioProductoComponent } from '../formulario-producto/formulario-producto.component';
import { ProductoService } from '../../servicios/producto.service';
import { FiltrosProducto, PaginacionProductos, Producto } from '../../modelos/producto.model';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [
    CommonModule,
    ImagenUrlPipe,
    FiltrosProductosComponent,
    FormularioProductoComponent
  ],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {
  
  private productoService = inject(ProductoService);

  // Signals
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  mostrarModal = signal(false);
  productoEditar = signal<Producto | null>(null);
  paginacion = signal<PaginacionProductos | null>(null);
  filtrosActivos = signal<FiltrosProducto>({});
  productosStockBajo = signal(0);

  ngOnInit(): void {
    this.cargarProductos();
  }

  /**
   * Cargar productos con filtros
   */
  cargarProductos(pagina: number = 1): void {
    this.cargando.set(true);
    
    this.productoService.obtenerProductos(this.filtrosActivos(), pagina).subscribe({
      next: (respuesta) => {
        console.log('✅ Productos cargados:', respuesta);
        this.productos.set(respuesta.data);
        this.paginacion.set(respuesta);
        this.calcularStockBajo(respuesta.data);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.cargando.set(false);
      }
    });
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(filtros: FiltrosProducto): void {
    this.filtrosActivos.set(filtros);
    this.cargarProductos(1);
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtrosActivos.set({});
    this.cargarProductos(1);
  }

  /**
   * Abrir modal para crear producto
   */
  abrirModalCrear(): void {
    this.productoEditar.set(null);
    this.mostrarModal.set(true);
  }

  /**
   * Abrir modal para editar producto
   */
  abrirModalEditar(producto: Producto): void {
    console.log('📝 Editando producto:', producto);
    this.productoEditar.set(producto);
    this.mostrarModal.set(true);
  }

  /**
   * Ver detalles del producto
   */
  verProducto(producto: Producto): void {
    const codigo = producto.codigo_producto || producto.codigo_lana || 'N/A';
    const nombre = producto.nombre || producto.nombre_producto || 'Sin nombre';
    const tipo = producto.tipo_lana || producto.tipo_de_producto || 'N/A';
    const color = producto.color || producto.color_producto || 'N/A';
    const talla = producto.talla_tamano || producto.talla_producto || 'N/A';
    const precio = producto.precio_unitario || producto.precio_producto || 0;
    const stock = producto.stock || producto.stock_disponible || 0;
    const stockMin = producto.stock_minimo || 0;
    const estado = producto.estado === 'activo' || producto.estado_producto === 'Activo' ? 'Activo' : 'Inactivo';
    const descripcion = producto.descripcion || 'Sin descripción';

    alert(`
📦 DETALLES DEL PRODUCTO

Código: ${codigo}
Nombre: ${nombre}
Tipo: ${tipo}
Color: ${color}
Talla: ${talla}
Precio: S/ ${precio.toFixed(2)}
Stock: ${stock} unidades
Stock mínimo: ${stockMin} unidades
Estado: ${estado}
Descripción: ${descripcion}
    `.trim());
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.productoEditar.set(null);
  }

  /**
   * Guardar producto (crear o actualizar)
   */
  guardarProducto(): void {
    this.cerrarModal();
    this.cargarProductos();
  }

  /**
   * Desactivar producto (no elimina, solo pone inactivo y stock en 0)
   */
  eliminarProducto(producto: Producto): void {
    const nombre = producto.nombre || producto.nombre_producto || 'este producto';
    const productoId = producto.producto_id || producto.id;
    
    console.log('🗑️ Intentando desactivar producto:', { productoId, nombre });
    
    if (!productoId) {
      alert('❌ Error: No se pudo identificar el producto');
      return;
    }
    
    if (confirm(`¿Desactivar "${nombre}"?\n\nEl producto se marcará como inactivo y su stock se pondrá en 0.\nNo aparecerá en el catálogo hasta que lo reactives editándolo.`)) {
      this.productoService.eliminarProducto(productoId).subscribe({
        next: () => {
          alert('✅ Producto desactivado correctamente\n\nEl producto ahora está inactivo con stock 0.\nPuedes reactivarlo editándolo y aumentando el stock.');
          this.cargarProductos();
        },
        error: (error) => {
          console.error('❌ Error al desactivar producto:', error);
          alert('❌ Error al desactivar el producto: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || (this.paginacion() && pagina > this.paginacion()!.last_page)) {
      return;
    }
    this.cargarProductos(pagina);
  }

  /**
   * Calcular productos con stock bajo
   */
  private calcularStockBajo(productos: Producto[]): void {
    const count = productos.filter(p => {
      const stock = p.stock || p.stock_disponible || 0;
      const stockMin = p.stock_minimo || 0;
      return stock <= stockMin;
    }).length;
    this.productosStockBajo.set(count);
  }

  /**
   * Obtener clase de badge según stock
   */
  getStockBadgeClass(producto: Producto): string {
    const stock = producto.stock || producto.stock_disponible || 0;
    const stockMin = producto.stock_minimo || 0;
    
    if (stock <= 0) return 'badge-danger';
    if (stock <= stockMin) return 'badge-warning';
    return 'badge-success';
  }

  /**
   * Obtener texto de stock
   */
  getStockText(stock: number): string {
    return `${stock} unid.`;
  }
}