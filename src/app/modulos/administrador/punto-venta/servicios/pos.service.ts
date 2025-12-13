import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
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
   * ⭐ BUSCAR CLIENTE - Búsqueda universal por nombre, DNI o teléfono
   */
  buscarCliente(termino: string): Observable<{ success: boolean; data: Cliente[]; message: string }> {
    console.log('🌐 === PosService.buscarCliente ===');
    console.log('🌐 Término:', termino);
    console.log('🌐 URL completa:', `${this.API_URL}/clientes/buscar?q=${termino}`);
    
    const params = new HttpParams().set('q', termino);
    
    return this.http.get<any>(`${this.API_URL}/clientes/buscar`, { params })
      .pipe(
        tap(response => {
          console.log('🌐 ✅ Respuesta del servidor:', response);
          console.log('🌐 Success:', response.success);
          console.log('🌐 Data:', response.data);
          console.log('🌐 Cantidad de clientes:', response.data?.length || 0);
          
          if (response.data && response.data.length > 0) {
            console.log('🌐 Primer cliente encontrado:', response.data[0]);
          }
        }),
        catchError(error => {
          console.error('🌐 ❌ Error en búsqueda:', error);
          console.error('🌐 Status:', error.status);
          console.error('🌐 Message:', error.message);
          console.error('🌐 Error completo:', error.error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Buscar cliente por teléfono (mantener para compatibilidad)
   */
  buscarClientePorTelefono(telefono: string): Observable<RespuestaCliente> {
    console.log('🌐 Buscando cliente por teléfono:', telefono);
    
    return this.http.get<RespuestaCliente>(
      `${this.API_URL}/clientes/telefono/${telefono}`
    ).pipe(
      tap(response => console.log('🌐 Respuesta teléfono:', response)),
      catchError(error => {
        console.error('🌐 Error búsqueda por teléfono:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ⭐ CREAR NUEVO CLIENTE
   */
  crearCliente(datos: any): Observable<RespuestaCliente> {
    console.log('🌐 === PosService.crearCliente ===');
    console.log('🌐 Datos recibidos:', datos);
    
    const solicitud: SolicitudCliente = {
      nombre: datos.nombre || '',
      dni: datos.dni || undefined,
      telefono: datos.telefono || '',
      email: datos.email || undefined,
      direccion: datos.direccion || undefined,
    };

    console.log('🌐 Solicitud preparada:', solicitud);
    console.log('🌐 URL:', `${this.API_URL}/clientes`);

    return this.http.post<RespuestaCliente>(`${this.API_URL}/clientes`, solicitud)
      .pipe(
        tap(response => {
          console.log('🌐 ✅ Cliente creado:', response);
          console.log('🌐 Data del cliente:', response.data);
        }),
        catchError(error => {
          console.error('🌐 ❌ Error al crear cliente:', error);
          console.error('🌐 Status:', error.status);
          console.error('🌐 Errores de validación:', error.error?.errors);
          return throwError(() => error);
        })
      );
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
   * ⭐ SELECCIONAR CLIENTE
   */
  seleccionarCliente(cliente: Cliente): void {
    console.log('✅ === Seleccionando cliente en servicio ===');
    console.log('✅ Cliente:', cliente);
    console.log('✅ ID:', cliente.cliente_id);
    console.log('✅ Nombre:', cliente.nombre_cliente);
    
    this.estado.update((estado) => ({
      ...estado,
      cliente_seleccionado: cliente,
    }));
    
    console.log('✅ Estado actualizado. Cliente seleccionado:', this.clienteSeleccionado());
  }

  /**
   * Limpiar cliente seleccionado
   */
  limpiarCliente(): void {
    this.estado.update((estado) => ({
      ...estado,
      cliente_seleccionado: null,
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
   * ⭐ PROCESAR VENTA POS - RUTA ACTUALIZADA Y CORREGIDA
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

    // ⭐ MAPEAR ITEMS CORRECTAMENTE
    const items = estadoActual.carrito.items.map((item) => {
      // ✅ Usar producto_id o id dependiendo de lo que esté disponible
      const productoId = item.producto.producto_id || item.producto.id;
      
      console.log('🔍 Mapeando item:', {
        nombre: item.producto.nombre,
        id: item.producto.id,
        producto_id: item.producto.producto_id,
        productoId_seleccionado: productoId,
        cantidad: item.cantidad,
        precio: item.precio_unitario
      });

      return {
        producto_id: productoId,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      };
    });

    const solicitud: SolicitudVenta = {
      cliente_id: estadoActual.cliente_seleccionado.cliente_id,
      items: items,
      metodo_pago: estadoActual.metodo_pago,
      canal_venta: estadoActual.canal_venta || 'Tienda física',
      observaciones: estadoActual.observaciones || undefined,
      descuento: estadoActual.carrito.descuento_total || undefined,
    };

    console.log('📤 === ENVIANDO SOLICITUD DE VENTA POS ===');
    console.log('📤 Cliente ID:', solicitud.cliente_id);
    console.log('📤 Items:', JSON.stringify(solicitud.items, null, 2));
    console.log('📤 Método de pago:', solicitud.metodo_pago);
    console.log('📤 Solicitud completa:', JSON.stringify(solicitud, null, 2));

    this.estado.update((estado) => ({
      ...estado,
      procesando_venta: true,
    }));

    // ⭐ RUTA ACTUALIZADA PARA POS
    return this.http.post<RespuestaVenta>(`${this.API_URL}/ventas/crear`, solicitud).pipe(
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
          console.error('❌ Status:', error.status);
          console.error('❌ Error completo:', error.error);
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
   * ⭐ RESETEAR POS - Limpiar todo
   */
  resetearPOS(): void {
    console.log('🔄 Reseteando POS');
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