import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosOnlineService } from '../../servicios/pedidos-online.service';
import { CambiarEstadoPedidoComponent } from '../cambiar-estado-pedido/cambiar-estado-pedido.component';
import { SeguimientoPedidoComponent } from '../../../../carrito/componentes/seguimiento-pedido/seguimiento-pedido.component';

@Component({
  selector: 'app-detalle-pedido-admin',
  standalone: true,
  imports: [
    CommonModule,
    CambiarEstadoPedidoComponent,
    SeguimientoPedidoComponent
  ],
  templateUrl: './detalle-pedido-admin.component.html',
  styleUrls: ['./detalle-pedido-admin.component.scss']
})
export class DetallePedidoAdminComponent implements OnInit {
  pedido: any = null;
  cargando = true;
  error = '';
  pedidoId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidosService: PedidosOnlineService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pedidoId = +params['id'] || 0;
      console.log('🎯 ID del pedido:', this.pedidoId);
      if (this.pedidoId) {
        this.cargarPedido();
      }
    });
  }

cargarPedido(): void {
  if (!this.pedidoId) return;

  this.cargando = true;
  this.error = '';

  console.log('📞 Llamando a GET /api/ventas/' + this.pedidoId);

  // ✅ USAR obtenerPedido() en lugar de listarPedidos()
  this.pedidosService.obtenerPedido(this.pedidoId).subscribe({
    next: (respuesta: any) => {
      console.log('✅ Respuesta completa:', respuesta);

      if (respuesta.success && respuesta.data) {
        const pedidoRaw = respuesta.data; // ⚠️ YA NO es un array, es un objeto
        
        console.log('═══════════════════════════════════════');
        console.log('📦 PEDIDO RAW COMPLETO:');
        console.log('═══════════════════════════════════════');
        console.log(JSON.stringify(pedidoRaw, null, 2));
        console.log('═══════════════════════════════════════');
        
        console.log('🔍 Verificando campos:');
        console.log('  - cliente:', pedidoRaw.cliente);
        console.log('  - cliente_nombre:', pedidoRaw.cliente_nombre);
        console.log('  - items:', pedidoRaw.items);
        console.log('  - items.length:', pedidoRaw.items?.length || 0);
        console.log('  - comprobante_pago:', pedidoRaw.comprobante_pago);
        console.log('  - codigo_operacion:', pedidoRaw.codigo_operacion);
        
        if (pedidoRaw.items && pedidoRaw.items.length > 0) {
          console.log('📦 PRODUCTOS ENCONTRADOS:');
          pedidoRaw.items.forEach((item: any, index: number) => {
            console.log(`  ${index + 1}. ${item.nombre_producto} (ID: ${item.producto_id})`);
            console.log(`     - Cantidad: ${item.cantidad}`);
            console.log(`     - Precio: S/ ${item.precio_unitario}`);
          });
        } else {
          console.warn('⚠️ NO HAY ITEMS EN EL PEDIDO');
        }
        
        // Mapear datos
        this.pedido = {
          venta_id: pedidoRaw.venta_id,
          numero_venta: pedidoRaw.numero_venta || `V-${String(pedidoRaw.venta_id).padStart(6, '0')}`,
          fecha_venta: pedidoRaw.fecha_venta,
          estado_venta: pedidoRaw.estado_venta,
          
          // Cliente
          cliente: {
            nombre_cliente: 
              pedidoRaw.cliente?.nombre_cliente || 
              pedidoRaw.cliente_nombre || 
              'Sin nombre',
            
            telefono: 
              pedidoRaw.cliente?.telefono || 
              pedidoRaw.cliente_telefono || 
              pedidoRaw.telefono_contacto || 
              'Sin teléfono',
            
            email: 
              pedidoRaw.cliente?.email || 
              pedidoRaw.cliente?.correo || 
              'Sin email'
          },
          
          // Montos
          subtotal: parseFloat(pedidoRaw.subtotal || 0),
          descuento: parseFloat(pedidoRaw.descuento || 0),
          total_venta: parseFloat(pedidoRaw.total || pedidoRaw.total_venta || 0),
          
          // Información adicional
          metodo_pago: pedidoRaw.metodo_pago || 'No especificado',
          canal_venta: pedidoRaw.canal_venta || 'Web',
          direccion_envio: pedidoRaw.direccion_envio,
          telefono_contacto: pedidoRaw.telefono_contacto,
          observaciones: pedidoRaw.observaciones,
          
          // ⭐ COMPROBANTE DE PAGO (AGREGADO)
          comprobante_pago: pedidoRaw.comprobante_pago,
          codigo_operacion: pedidoRaw.codigo_operacion,
          
          // Productos
          productos: (pedidoRaw.items || []).map((item: any) => ({
            producto_id: item.producto_id,
            nombre_producto: item.nombre_producto || 'Producto',
            imagen_url: item.imagen_url,
            cantidad: item.cantidad || 0,
            precio_unitario: parseFloat(item.precio_unitario || 0),
            subtotal: parseFloat(item.subtotal || 0)
          }))
        };
        
        console.log('═══════════════════════════════════════');
        console.log('✅ PEDIDO FINAL MAPEADO:');
        console.log('  Cliente:', this.pedido.cliente);
        console.log('  Email:', this.pedido.cliente.email);
        console.log('  Productos:', this.pedido.productos);
        console.log('  Cantidad:', this.pedido.productos.length);
        console.log('  Comprobante:', this.pedido.comprobante_pago);
        console.log('  Código operación:', this.pedido.codigo_operacion);
        console.log('═══════════════════════════════════════');
        
      } else {
        console.error('❌ Respuesta no válida:', respuesta);
        this.error = 'Pedido no encontrado';
      }
      
      this.cargando = false;
    },
    error: (error: any) => {
      console.error('❌ ERROR:', error);
      this.error = 'Error al cargar el pedido';
      this.cargando = false;
    }
  });
}

  onEstadoCambiado(evento: { nuevoEstado: string, observaciones: string }): void {
    if (!this.pedidoId) return;

    console.log('🔄 Cambiando estado:', evento);

    this.pedidosService.actualizarEstadoPedido(
      this.pedidoId,
      evento.nuevoEstado,
      evento.observaciones
    ).subscribe({
      next: (respuesta: any) => {
        console.log('✅ Estado actualizado:', respuesta);
        alert('Estado actualizado correctamente');
        this.cargarPedido();
      },
      error: (error: any) => {
        console.error('❌ Error:', error);
        const mensaje = error.error?.message || error.message || 'Error desconocido';
        alert('Error al actualizar el estado: ' + mensaje);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin/punto-venta']);
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get totalProductos(): number {
    if (!this.pedido?.productos) return 0;
    return this.pedido.productos.reduce((total: number, p: any) => total + (p.cantidad || 0), 0);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent && parent.classList.contains('producto-imagen')) {
      parent.innerHTML = '<div class="producto-icono-fallback">📦</div>';
    }
  }

/**
 * ✅ Abrir imagen del comprobante en tamaño completo
 */
abrirImagenCompleta(url: string): void {
  if (!url) return;
  window.open(url, '_blank', 'width=800,height=600');
}

/**
 * ✅ Manejar error al cargar imagen del comprobante
 */
onComprobanteError(event: any): void {
  console.error('❌ Error al cargar comprobante:', event);
  event.target.src = 'assets/imagenes/no-image.png';
}

/**
 * ✅ Copiar código de operación al portapapeles
 */
copiarCodigo(codigo: string): void {
  if (!codigo) return;
  
  navigator.clipboard.writeText(codigo).then(() => {
    alert('✅ Código copiado: ' + codigo);
  }).catch(err => {
    console.error('❌ Error al copiar:', err);
    prompt('Código (Ctrl+C para copiar):', codigo);
  });
}

}