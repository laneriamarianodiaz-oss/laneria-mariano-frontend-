import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../../core/servicios/producto.service';
import { Producto } from '../../../../compartido/modelos/producto.modelo';
import { DetalleProductoModalComponent } from '../../../../compartido/componentes/detalle-producto-modal/detalle-producto-modal.component';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-catalogo-completo',
  standalone: true,
  imports: [CommonModule, DetalleProductoModalComponent],
  templateUrl: './catalogo-completo.component.html',
  styleUrl: './catalogo-completo.component.scss'
})
export class CatalogoCompletoComponent implements OnInit {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  cargando = false;
  categoriaSeleccionada: string = 'Todas';
  busqueda: string = '';

  /* MAPA DE IMÁGENES DE CATEGORÍAS */
  imagenesCategorias: any = {
    "Lanas": "lanas.png",
    "Amigurumis": "lanas.png",
    "Cahuas": "lanas.png",
    "Ropas": "lanas.png",
    "kits": "lanas.png",
    "Accesorios": "lanas.png",
    "Todas": "lanas.png"
  };

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
  window.scrollTo(0, 0);
}

    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.categoriaSeleccionada = params['categoria'];
      }
      if (params['busqueda']) {
        this.busqueda = params['busqueda'];
      }
      this.cargarProductos();
    });
  }

  cargarProductos(): void {
    this.cargando = true;
    const filtros: any = { en_stock: true };

    this.productoService.obtenerProductos(filtros).subscribe({
      next: (respuesta) => {
        this.productos = respuesta.data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let productosFiltrados = [...this.productos];

    if (this.categoriaSeleccionada && this.categoriaSeleccionada !== 'Todas') {
      productosFiltrados = productosFiltrados.filter(
        p => p.categoria === this.categoriaSeleccionada
      );
    }

    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();

      productosFiltrados = productosFiltrados.filter(p =>
        p.nombre_producto?.toLowerCase().includes(busquedaLower) ||
        p.codigo_producto?.toLowerCase().includes(busquedaLower) ||
        p.descripcion?.toLowerCase().includes(busquedaLower) ||
        p.tipo_de_producto?.toLowerCase().includes(busquedaLower) ||
        p.color_producto?.toLowerCase().includes(busquedaLower)
      );
    }

    this.productosFiltrados = productosFiltrados;
  }

  verDetalle(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  agregarAlCarrito(producto: Producto, event?: Event): void {
    if (event) event.stopPropagation();

    const idProducto = producto.producto_id || (producto as any).id;
    if (!idProducto) {
      alert('Producto inválido');
      return;
    }

    const productoNormalizado = { ...producto, producto_id: idProducto };
    this.carritoService.agregarProducto(productoNormalizado as Producto, 1);

    alert(`${producto.nombre_producto} agregado al carrito`);
    this.productoSeleccionado = null;
  }

  volverInicio(): void {
    this.router.navigate(['/catalogo']);
  }
}
