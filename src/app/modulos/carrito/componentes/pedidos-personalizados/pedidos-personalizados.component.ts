import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../../../core/servicios/producto.service';
import { Producto } from '../../../../compartido/modelos/producto.modelo';
import { DetalleProductoModalComponent } from '../../../../compartido/componentes/detalle-producto-modal/detalle-producto-modal.component';

@Component({
  selector: 'app-pedidos-personalizados',
  standalone: true,
  imports: [CommonModule, DetalleProductoModalComponent],
  templateUrl: './pedidos-personalizados.component.html',
  styleUrl: './pedidos-personalizados.component.scss'
})
export class PedidosPersonalizadosComponent implements OnInit {
  productosMuestra: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  cargando = false;

  // ⚙️ CONFIGURACIÓN DE WHATSAPP
  numeroWhatsApp = '51964674477'; // ← CAMBIAR POR TU NÚMERO (código país + número)
  
  // Mensajes de ejemplo para diferentes tipos de pedidos
  tiposPedidos = [
    {
      titulo: 'Gorros Personalizados',
      descripcion: 'Gorros tejidos con diseños únicos y colores a tu elección',
      imagen: 'personalizado/gorros.jpeg',
      mensaje: '¡Hola! Me interesa un gorro personalizado 🧶'
    },
    {
      titulo: 'Chompas a Medida',
      descripcion: 'Chompas tejidas con tu talla y diseño preferido',
      imagen: 'personalizado/chompas.jpeg',
      mensaje: '¡Hola! Quiero una chompa personalizada 🧥'
    },
    {
      titulo: 'Mantas y Cobijas',
      descripcion: 'Mantas tejidas del tamaño y color que necesites',
      imagen: 'personalizado/mantas.jpeg',
      mensaje: '¡Hola! Me gustaría una manta personalizada 🛏️'
    },
    {
      titulo: 'Amigurumis Especiales',
      descripcion: 'Muñecos tejidos con el diseño que imagines',
      imagen: 'personalizado/amigurumis.jpeg',
      mensaje: '¡Hola! Quiero un amigurumi personalizado 🧸'
    }
  ];

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.cargarProductosMuestra();
  }

  cargarProductosMuestra(): void {
    this.cargando = true;
    
    this.productoService.obtenerProductos({ en_stock: true }).subscribe({
      next: (respuesta) => {
        // Mostrar solo los primeros 4-6 productos como muestra
        this.productosMuestra = respuesta.data.slice(0, 6);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
      }
    });
  }

  /**
   * Contactar por WhatsApp con tipo de pedido
   */
  contactarPorTipo(tipoPedido: any): void {
    const mensaje = encodeURIComponent(tipoPedido.mensaje);
    const urlWhatsApp = `https://wa.me/${this.numeroWhatsApp}?text=${mensaje}`;
    window.open(urlWhatsApp, '_blank');
  }

  /**
   * Contactar por WhatsApp con producto específico
   */
  contactarConProducto(producto: Producto): void {
    const mensaje = `¡Hola! Me interesa el producto:\n\n` +
                    `📦 ${producto.nombre_producto}\n` +
                    `💰 Precio: S/ ${producto.precio_unitario || producto.precio_producto}\n\n` +
                    `Me gustaría personalizarlo. ¿Podrías ayudarme?`;
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${this.numeroWhatsApp}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, '_blank');
  }

  /**
   * Contactar directamente (sin producto específico)
   */
  contactarDirecto(): void {
    const mensaje = '¡Hola! Me gustaría hacer un pedido personalizado 🎨✨';
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${this.numeroWhatsApp}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, '_blank');
  }

  verDetalle(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  volverInicio(): void {
    this.router.navigate(['/catalogo']);
  }
}