import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PedidoService } from '../../servicios/pedido.service';
import { Pedido } from '../../../../compartido/modelos/pedido.modelo';
import { DetallePedidoComponent } from '../detalle-pedido/detalle-pedido.component';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    DetallePedidoComponent
  ],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.scss'
})
export class MisPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  cargando = true;
  error = '';

  // Variables para el modal
  pedidoSeleccionado: Pedido | null = null;
  mostrarDetalle: boolean = false;

  // ⭐ NUEVO: Variables para subir comprobante
  subiendoComprobante: number | null = null; // ID del pedido que está subiendo
  archivoSeleccionado: File | null = null;
  previewComprobante: string | null = null;
  pedidoParaComprobante: Pedido | null = null;

  constructor(
    public pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';
    
    this.pedidoService.obtenerMisPedidos().subscribe({
      next: (respuesta) => {
        console.log('✅ Pedidos recibidos:', respuesta);
        
        if (respuesta.success && respuesta.data) {
          // Adaptar datos del backend al modelo frontend
          this.pedidos = respuesta.data.map((venta: any) => ({
            id: venta.venta_id,
            venta_id: venta.venta_id,
            numero_venta: venta.numero_venta,
            fecha_pedido: venta.fecha_venta,
            fecha_venta: venta.fecha_venta,
            fecha_venta_formato: venta.fecha_venta,
            estado: this.mapearEstado(venta.estado_venta),
            estado_venta: venta.estado_venta,
            total: venta.total_venta,
            total_venta: venta.total_venta,
            subtotal: venta.subtotal || 0,
            descuento: venta.descuento || 0,
            direccion_envio: venta.direccion_envio,
            telefono_contacto: venta.telefono_contacto,
            metodo_pago: venta.metodo_pago,
            canal_venta: venta.canal_venta,
            codigo_operacion: venta.codigo_operacion,
            comprobante_pago: venta.comprobante_pago, // ⭐ URL de Cloudinary
            observaciones: venta.observaciones,
            cliente: venta.cliente,
            cliente_id: venta.cliente_id,
            
            // Mapear productos para la LISTA (items)
            items: (venta.productos || venta.detalles || []).map((item: any) => {
              // Si viene del formato nuevo (productos)
              if (item.nombre) {
                return {
                  producto_id: item.producto_id,
                  producto: {
                    producto_id: item.producto_id,
                    nombre_producto: item.nombre,
                    imagen_url: item.imagen_url
                  },
                  cantidad: item.cantidad,
                  precio_unitario: item.precio_unitario,
                  subtotal: item.subtotal
                };
              }
              // Si viene del formato antiguo (detalles)
              return {
                detalle_venta_id: item.detalle_venta_id,
                producto_id: item.producto_id,
                producto: item.producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
              };
            }),
            
            // Mapear productos para el MODAL (productos)
            productos: (venta.productos || venta.detalles || []).map((item: any) => ({
              producto_id: item.producto_id,
              nombre_producto: item.nombre || item.producto?.nombre_producto || 'Producto',
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal: item.subtotal,
              imagen_url: item.imagen_url || item.producto?.imagen_url
            }))
          }));
        }
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar pedidos:', error);
        this.error = error.error?.message || 'Error al cargar tus pedidos. Por favor intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  /**
   * Mapear estado del backend a formato frontend
   */
  mapearEstado(estadoBackend: string): any {
    const mapeo: { [key: string]: string } = {
      'Pendiente': 'pendiente',
      'Confirmado': 'confirmado',
      'En Proceso': 'confirmado',
      'Enviado': 'enviado',
      'Entregado': 'entregado',
      'Completado': 'entregado',
      'Cancelado': 'cancelado',
      'Cancelada': 'cancelado'
    };
    return mapeo[estadoBackend] || estadoBackend.toLowerCase();
  }

  /**
   * Obtener texto del estado para mostrar
   */
  obtenerEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      // Estados del backend
      'Pendiente': '⏳ Pendiente',
      'Confirmado': '✓ Confirmado',
      'En Proceso': '🔄 En Proceso',
      'Enviado': '🚚 Enviado',
      'Entregado': '📦 Entregado',
      'Completado': '✅ Completado',
      'Cancelado': '❌ Cancelado',
      // Estados mapeados
      'pendiente': '⏳ Pendiente',
      'confirmado': '✓ Confirmado',
      'enviado': '🚚 Enviado',
      'entregado': '📦 Entregado',
      'cancelado': '❌ Cancelado'
    };
    return estados[estado] || estado;
  }

  /**
   * Ver detalle del pedido en MODAL
   */
  verDetalle(pedido: Pedido): void {
    console.log('👁️ Abriendo modal de detalle:', pedido);
    this.pedidoSeleccionado = pedido;
    this.mostrarDetalle = true;
  }

  /**
   * Cerrar modal
   */
  cerrarDetalle(): void {
    console.log('❌ Cerrando modal');
    this.mostrarDetalle = false;
    this.pedidoSeleccionado = null;
  }

  /**
   * Cancelar pedido
   */
  cancelarPedido(pedido: Pedido, event: Event): void {
    event.stopPropagation();

    // Verificar si puede cancelar
    const estado = pedido.estado_venta || pedido.estado;
    if (!this.puedeCancelar(estado)) {
      alert('Este pedido no puede ser cancelado en su estado actual');
      return;
    }

    const motivo = prompt('¿Por qué deseas cancelar este pedido?');
    
    if (motivo === null) {
      return; // Usuario canceló
    }

    const numeroVenta = pedido.numero_venta || `#${pedido.id || pedido.venta_id}`;
    if (confirm(`¿Estás seguro de cancelar el pedido ${numeroVenta}?`)) {
      const id = pedido.venta_id || pedido.id;
      if (!id) {
        alert('Error: No se pudo identificar el pedido');
        return;
      }

      this.pedidoService.cancelarPedido(id, motivo).subscribe({
        next: (respuesta) => {
          console.log('✅ Pedido cancelado:', respuesta);
          alert('Pedido cancelado exitosamente');
          this.cerrarDetalle(); // Cerrar modal si está abierto
          this.cargarPedidos(); // Recargar lista
        },
        error: (error) => {
          console.error('❌ Error al cancelar:', error);
          alert('Error al cancelar pedido: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  /**
   * Verificar si puede cancelar
   */
  puedeCancelar(estado: string | undefined): boolean {
    if (!estado) return false;
    return ['Pendiente', 'Confirmado', 'pendiente', 'confirmado'].includes(estado);
  }

  /**
   * ⭐ NUEVO: Verificar si puede subir comprobante
   */
  puedeSubirComprobante(pedido: Pedido): boolean {
    const estado = pedido.estado_venta || pedido.estado;
    // Solo si está pendiente Y no tiene comprobante
    return estado === 'Pendiente' && !pedido.comprobante_pago;
  }

  /**
   * ⭐ NUEVO: Abrir selector de archivo
   */
  seleccionarComprobante(pedido: Pedido): void {
    this.pedidoParaComprobante = pedido;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.onArchivoSeleccionado(file);
      }
    };
    input.click();
  }

  /**
   * ⭐ NUEVO: Cuando se selecciona un archivo
   */
  onArchivoSeleccionado(file: File): void {
    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('❌ Formato no permitido. Solo JPG, PNG, GIF, WEBP o PDF');
      return;
    }

    // Validar tamaño (10MB como el backend)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ El archivo supera el tamaño máximo de 10MB');
      return;
    }

    this.archivoSeleccionado = file;

    // Crear preview si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewComprobante = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewComprobante = 'pdf';
    }

    // Preguntar código de operación
    const codigoOperacion = prompt('Código de operación (opcional):');
    
    // Confirmar subida
    if (confirm(`¿Subir comprobante para el pedido ${this.pedidoParaComprobante?.numero_venta}?`)) {
      this.subirComprobante(codigoOperacion || undefined);
    } else {
      this.archivoSeleccionado = null;
      this.previewComprobante = null;
    }
  }

  /**
   * ⭐ NUEVO: Subir comprobante al backend
   */
  subirComprobante(codigoOperacion?: string): void {
    if (!this.archivoSeleccionado || !this.pedidoParaComprobante) {
      return;
    }

    const pedidoId = this.pedidoParaComprobante.venta_id || this.pedidoParaComprobante.id;
    if (!pedidoId) {
      alert('Error: No se pudo identificar el pedido');
      return;
    }

    this.subiendoComprobante = pedidoId;

    this.pedidoService.subirComprobante(pedidoId, this.archivoSeleccionado, codigoOperacion).subscribe({
      next: (respuesta) => {
        console.log('✅ Comprobante subido:', respuesta);
        alert('✅ Comprobante subido correctamente. Tu pedido será revisado pronto.');
        
        // Limpiar
        this.archivoSeleccionado = null;
        this.previewComprobante = null;
        this.pedidoParaComprobante = null;
        this.subiendoComprobante = null;
        
        // Recargar pedidos
        this.cargarPedidos();
      },
      error: (error) => {
        console.error('❌ Error al subir comprobante:', error);
        alert('❌ Error al subir comprobante: ' + (error.error?.message || error.message));
        this.subiendoComprobante = null;
      }
    });
  }

  /**
   * ⭐ NUEVO: Ver comprobante en nueva pestaña
   */
  verComprobante(pedido: Pedido): void {
    if (pedido.comprobante_pago) {
      window.open(pedido.comprobante_pago, '_blank');
    }
  }

  /**
   * Obtener icono del estado
   */
  obtenerIconoEstado(estado: string): string {
    return this.pedidoService.obtenerIconoEstado(estado);
  }

  /**
   * Obtener color del estado
   */
  obtenerColorEstado(estado: string): string {
    return this.pedidoService.obtenerColorEstado(estado);
  }
}