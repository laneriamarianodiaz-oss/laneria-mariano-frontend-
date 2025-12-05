import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  EstadoPOS,
  CarritoPOS,
  ItemCarrito,
  MetodoPago,
  CanalVenta,
  SolicitudVenta,
  RespuestaVenta,
  Cliente,
  RespuestaCliente,
  SolicitudCliente,
} from '../modelos/pos.model';
import { Producto } from '../../productos/modelos/producto.model';

@Injectable({
  providedIn: 'root',
})
export class PosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}`;

  // Estado inicial del carrito
  private readonly carritoInicial: CarritoPOS = {
    items: [],
    subtotal: 0,
    descuento_total: 0,
    total: 0,
    cantidad_items: 0,
  };

  // Estado inicial del POS
  private readonly estadoInicial: EstadoPOS = {
    carrito: this.carritoInicial,
    cliente_seleccionado: null,
    metodo_pago: null,
    canal_venta: 'Tienda física',
    observaciones: '',
    procesando_venta: false,
  };

  // Signal del estado
  private readonly estado = signal<EstadoPOS>(this.estadoInicial);

  // Computed signals públicos
  readonly carrito = computed(() => this.estado().carrito);
  readonly clienteSeleccionado = computed(
    () => this.estado().cliente_seleccionado
  );
  readonly metodoPago = computed(() => this.estado().metodo_pago);
  readonly canalVenta = computed(() => this.estado().canal_venta);
  readonly totalItems = computed(() => this.estado().carrito.cantidad_items);
  readonly totalVenta = computed(() => this.estado().carrito.total);
  readonly procesandoVenta = computed(() => this.estado().procesando_venta);

  /**
   * ⭐ NUEVO: Búsqueda universal de clientes por nombre, DNI o teléfono
   */
  buscarCliente(termino: string): Observable<{ success: boolean; data: Cliente[]; message: string }> {
    const params = new HttpParams().set('q', termino);
    
    return this.http.get<any>(`${this.API_URL}/clientes/buscar`, { params })
      .pipe(
        map(response => {
          console.log('✅ Búsqueda de clientes:', response);
          return response;
        })
      );
  }

  /**
   * Buscar cliente por teléfono (mantener para compatibilidad)
   */
  buscarClientePorTelefono(telefono: string): Observable<RespuestaCliente> {
    return this.http.get<RespuestaCliente>(
      `${this.API_URL}/clientes/buscar/telefono/${telefono}`
    );
  }

  /**
   * Crear nuevo cliente
   */
  crearCliente(datos: any): Observable<RespuestaCliente> {
    const solicitud: SolicitudCliente = {
      nombre: datos.nombre || '',
      dni: datos.dni || undefined,
      telefono: datos.telefono || '',
      email: datos.email || undefined,
      direccion: datos.direccion || undefined,
    };

    return this.http.post<RespuestaCliente>(`${this.API_URL}/clientes`, solicitud);
  }

  /**
   * Agregar producto al carrito
   */
  agregarProducto(producto: Producto, cantidad: number): void {
    const estadoActual = this.estado();
    const items = [...estadoActual.carrito.items];

    const indiceExistente = items.findIndex(
      (item) => item.producto.id === producto.id
    );

    if (indiceExistente >= 0) {
      items[indiceExistente].cantidad += cantidad;
      items[indiceExistente].subtotal =
        items[indiceExistente].cantidad * items[indiceExistente].precio_unitario;
    } else {
      const nuevoItem: ItemCarrito = {
        producto,
        cantidad,
        precio_unitario: producto.precio_unitario,
        subtotal: producto.precio_unitario * cantidad,
      };
      items.push(nuevoItem);
    }

    this.actualizarCarrito(items);
  }

  /**
   * Actualizar cantidad de un item
   */
  actualizarCantidad(index: number, cantidad: number): void {
    const estadoActual = this.estado();
    const items = [...estadoActual.carrito.items];

    if (items[index]) {
      items[index].cantidad = cantidad;
      items[index].subtotal = items[index].precio_unitario * cantidad;
      this.actualizarCarrito(items);
    }
  }

  /**
   * Eliminar item del carrito
   */
  eliminarItem(index: number): void {
    const estadoActual = this.estado();
    const items = estadoActual.carrito.items.filter((_, i) => i !== index);
    this.actualizarCarrito(items);
  }

  /**
   * Aplicar descuento a un item
   */
  aplicarDescuentoItem(index: number, descuento: number): void {
    const estadoActual = this.estado();
    const items = [...estadoActual.carrito.items];

    if (items[index]) {
      items[index].descuento = descuento;
      this.actualizarCarrito(items);
    }
  }

  /**
   * Vaciar carrito
   */
  vaciarCarrito(): void {
    this.actualizarCarrito([]);
  }

  /**
   * Seleccionar cliente
   */
  seleccionarCliente(cliente: Cliente): void {
    this.estado.update((estado) => ({
      ...estado,
      cliente_seleccionado: cliente,
    }));
  }

  /**
   * Seleccionar método de pago
   */
  seleccionarMetodoPago(metodo: MetodoPago): void {
    this.estado.update((estado) => ({
      ...estado,
      metodo_pago: metodo,
    }));
  }

  /**
   * Seleccionar canal de venta
   */
  seleccionarCanalVenta(canal: CanalVenta): void {
    this.estado.update((estado) => ({
      ...estado,
      canal_venta: canal,
    }));
  }

  /**
   * Agregar observaciones
   */
  agregarObservaciones(observaciones: string): void {
    this.estado.update((estado) => ({
      ...estado,
      observaciones,
    }));
  }

  /**
   * Procesar venta
   */
  procesarVenta(): Observable<RespuestaVenta> {
    const estadoActual = this.estado();

    if (estadoActual.carrito.items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    if (!estadoActual.cliente_seleccionado) {
      throw new Error('Debe seleccionar un cliente');
    }

    if (!estadoActual.metodo_pago) {
      throw new Error('Debe seleccionar un método de pago');
    }

    const solicitud: SolicitudVenta = {
      cliente_id: estadoActual.cliente_seleccionado.cliente_id,
      items: estadoActual.carrito.items.map((item) => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      })),
      metodo_pago: estadoActual.metodo_pago,
      canal_venta: estadoActual.canal_venta || 'Tienda física',
      observaciones: estadoActual.observaciones || undefined,
      descuento: estadoActual.carrito.descuento_total || undefined,
    };

    console.log('📤 Enviando solicitud de venta:', solicitud);

    this.estado.update((estado) => ({
      ...estado,
      procesando_venta: true,
    }));

    return this.http.post<RespuestaVenta>(`${this.API_URL}/ventas`, solicitud).pipe(
      tap({
        next: (respuesta) => {
          console.log('✅ Venta procesada exitosamente:', respuesta);
          this.estado.update((estado) => ({
            ...estado,
            procesando_venta: false,
          }));
        },
        error: (error) => {
          console.error('❌ Error al procesar venta:', error);
          this.estado.update((estado) => ({
            ...estado,
            procesando_venta: false,
          }));
        },
      })
    );
  }

  /**
   * Generar comprobante PDF
   */
  generarComprobante(ventaId: number): Observable<Blob> {
    return this.http.post(
      `${this.API_URL}/ventas/${ventaId}/comprobante`,
      {},
      { responseType: 'blob' }
    );
  }

  /**
   * Resetear POS
   */
  resetearPOS(): void {
    this.estado.set(this.estadoInicial);
  }

  /**
   * Actualizar carrito y recalcular totales
   */
  private actualizarCarrito(items: ItemCarrito[]): void {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const descuento_total = items.reduce(
      (sum, item) => sum + (item.descuento || 0),
      0
    );
    const total = subtotal - descuento_total;
    const cantidad_items = items.reduce((sum, item) => sum + item.cantidad, 0);

    const nuevoCarrito: CarritoPOS = {
      items,
      subtotal,
      descuento_total,
      total,
      cantidad_items,
    };

    this.estado.update((estado) => ({
      ...estado,
      carrito: nuevoCarrito,
    }));
  }
}