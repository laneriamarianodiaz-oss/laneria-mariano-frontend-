import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../../../core/servicios/producto.service';
import { Producto } from '../../../../compartido/modelos/producto.modelo';
import { DetalleProductoModalComponent } from '../../../../compartido/componentes/detalle-producto-modal/detalle-producto-modal.component';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, DetalleProductoModalComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit, OnDestroy {
  productosDestacados: Producto[] = [];
  productosPersonalizados: Producto[] = [];
  slideActual = 0;
  intervaloCarrusel: any;
  productoSeleccionado: Producto | null = null;
  cargando = false;

  slides = [
    { imagen: 'banner/banner2.jpg', titulo: '', subtitulo: '' },
    { imagen: 'banner/banner3.jpg', titulo: '', subtitulo: '' },
    { imagen: 'banner/banner1.jpg', titulo: '', subtitulo: '' }
  ];

  ofertas = [
    { nombre: 'Amigurumis', imagen: 'ofertas/oferta1.jpg' },
    { nombre: 'Gorros', imagen: 'ofertas/oferta2.jpg' },
    { nombre: 'Herramientas', imagen: 'ofertas/oferta3.jpg' },
    { nombre: 'Accesorios', imagen: 'ofertas/oferta4.jpg' }
  ];

  categorias = [
    { nombre: 'Lanas', imagen: 'categorias/lanas.jpeg' },
    { nombre: 'Cahuas', imagen: 'categorias/cahuas.jpeg' },
    { nombre: 'Amigurumis', imagen: 'categorias/amigurumis.jpeg' },
    { nombre: 'Ropas', imagen: 'categorias/ropas.jpeg' },
    { nombre: 'Accesorios', imagen: 'categorias/accesorios.jpeg' },
    { nombre: 'Kits', imagen: 'categorias/kits.jpeg' }
  ];

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    if (isPlatformBrowser(this.platformId)) {
      this.iniciarCarrusel();
    }
  }

  ngOnDestroy(): void {
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
    }
  }

  iniciarCarrusel(): void {
    this.intervaloCarrusel = setInterval(() => {
      this.siguienteSlide();
    }, 5000);
  }

  siguienteSlide(): void {
    this.slideActual = (this.slideActual + 1) % this.slides.length;
  }

  anteriorSlide(): void {
    this.slideActual = this.slideActual === 0 ? this.slides.length - 1 : this.slideActual - 1;
  }

  irASlide(index: number): void {
    this.slideActual = index;
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.obtenerProductos({}).subscribe({
      next: (respuesta) => {
        const productos = respuesta.data;
        this.productosDestacados = productos.slice(0, 4);
        this.productosPersonalizados = productos.slice(0, 4);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
      }
    });
  }

  irAOferta(oferta: any): void {
    console.log('Ir a oferta:', oferta);
  }

  irACategoria(categoria: any): void {
    this.router.navigate(['/catalogo/completo'], {
      queryParams: { categoria: categoria.nombre }
    });
  }

  irACatalogoCompleto(): void {
    this.router.navigate(['/catalogo/completo']);
  }

  // ✅ NUEVO: Ir a pedidos personalizados
  irAPedidosPersonalizados(): void {
    this.router.navigate(['/catalogo/personalizados']);
  }

  verDetalle(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  agregarAlCarrito(producto: Producto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    console.log('🛒 Intentando agregar producto:', producto);
    
    const idProducto = producto.producto_id || (producto as any).id;
    
    if (!producto || !idProducto) {
      console.error('❌ Producto inválido:', producto);
      alert('Error: Producto inválido (sin ID)');
      return;
    }

    const productoNormalizado = {
      ...producto,
      producto_id: idProducto
    };

    console.log('✅ Producto normalizado:', productoNormalizado);

    this.carritoService.agregarProducto(productoNormalizado as Producto, 1);
    alert(`${producto.nombre_producto} agregado al carrito`);
    this.productoSeleccionado = null;
  }
}