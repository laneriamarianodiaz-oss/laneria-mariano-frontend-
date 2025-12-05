import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Carrito, ItemCarrito } from '../../../compartido/modelos/carrito.modelo';
import { Producto } from '../../../compartido/modelos/producto.modelo';
import { entorno } from '../../../../entornos/entorno';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoSubject = new BehaviorSubject<Carrito>({ items: [], total: 0 });
  public carrito$: Observable<Carrito> = this.carritoSubject.asObservable();
  private urlApi = entorno.urlApi;

  constructor(private http: HttpClient) {
    this.inicializarCarrito();
  }

  /**
   * Inicializar carrito: intenta cargar del backend, si falla usa localStorage
   */
private inicializarCarrito(): void {
  const token = this.obtenerToken();
  
  if (token) {
    this.cargarCarritoBackend();
  } else {
    // Sin token, carrito vacío
    this.carritoSubject.next({ items: [], total: 0 });
  }
}

  /**
   * Cargar carrito desde el backend
   */
  public cargarCarritoBackend(): void {
    this.http.get<any>(`${this.urlApi}/carrito`).subscribe({
      next: (respuesta) => {
        const carritoBackend = this.convertirCarritoBackend(respuesta.data);
        this.carritoSubject.next(carritoBackend);
      },
      error: (error) => {
        console.error('Error al cargar carrito del backend:', error);
        this.cargarCarritoLocal();
      }
    });
  }

  /**
   * Convertir respuesta del backend al formato local
   */
  private convertirCarritoBackend(data: any): Carrito {
    const items: ItemCarrito[] = data.carrito.detalles.map((detalle: any) => ({
      producto: {
        id: detalle.producto.producto_id,
        producto_id: detalle.producto.producto_id,
        nombre_producto: detalle.producto.nombre_producto,
        precio_producto: detalle.precio_unitario,
        precio_unitario: detalle.precio_unitario,
        imagen_url: detalle.producto.imagen_url,
        stock_disponible: detalle.producto.stock_disponible
      },
      cantidad: detalle.cantidad,
      detalle_carrito_id: detalle.detalle_carrito_id
    }));

    return {
      items: items,
      total: data.total
    };
  }

  /**
   * Cargar carrito desde localStorage
   */
  private cargarCarritoLocal(): void {
    if (typeof localStorage !== 'undefined') {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        this.carritoSubject.next(carrito);
      }
    }
  }

  /**
   * Guardar carrito en localStorage (solo para invitados)
   */
  private guardarCarritoLocal(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('carrito', JSON.stringify(this.carritoSubject.value));
    }
  }

  /**
   * Obtener token de autenticación
   */
private obtenerToken(): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(entorno.claveToken);
  }
  return null;
}

  /**
   * Agregar producto al carrito
   */
  /**
   * Agregar producto al carrito
   */
  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const token = this.obtenerToken();
    console.log('🔑 Token encontrado:', token);
    console.log('📦 Producto a agregar:', producto);
    console.log('📦 Cantidad:', cantidad);

    // ⭐ VALIDAR QUE EL PRODUCTO EXISTE
    if (!producto || !producto.producto_id) {
      console.error('❌ Producto inválido:', producto);
      alert('Error: Producto inválido');
      return;
    }

    if (token) {
      // Usuario autenticado: usar backend
      console.log('✅ Usuario autenticado - usando backend');
      
      const body = {
        producto_id: producto.producto_id,
        cantidad: cantidad
      };

      console.log('📤 Enviando al backend:', body);

      this.http.post<any>(`${this.urlApi}/carrito/agregar`, body).subscribe({
        next: (respuesta) => {
          console.log('✅ Respuesta del servidor:', respuesta);
          const carritoBackend = this.convertirCarritoBackend(respuesta.data);
          this.carritoSubject.next(carritoBackend);
          console.log('✅ Carrito actualizado:', carritoBackend);
        },
        error: (error) => {
          console.error('❌ Error al agregar al carrito:', error);
          console.error('📋 Detalles del error:', error.error);
          alert(error.error?.message || 'Error al agregar producto al carrito');
        }
      });
    } else {
      // Usuario invitado: usar localStorage
      console.log('👤 Usuario invitado - usando localStorage');
      const carritoActual = this.carritoSubject.value;
      const itemExistente = carritoActual.items.find(item => 
        item.producto.producto_id === producto.producto_id
      );

      if (itemExistente) {
        itemExistente.cantidad += cantidad;
      } else {
        carritoActual.items.push({ 
          producto: {
            ...producto,
            id: producto.producto_id || producto.id || 0
          }, 
          cantidad 
        });
      }

      this.actualizarTotal(carritoActual);
    }
  }

  /**
   * Eliminar producto del carrito
   */
  eliminarProducto(productoId: number): void {
    const token = this.obtenerToken();
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.items.find(i => i.producto.producto_id === productoId);

    if (token && item && (item as any).detalle_carrito_id) {
      // Usuario autenticado: usar backend
      this.http.delete<any>(`${this.urlApi}/carrito/detalle/${(item as any).detalle_carrito_id}`).subscribe({
        next: (respuesta) => {
          const carritoBackend = this.convertirCarritoBackend(respuesta.data);
          this.carritoSubject.next(carritoBackend);
        },
        error: (error) => {
          console.error('Error al eliminar del carrito:', error);
        }
      });
    } else {
      // Usuario invitado: usar localStorage
      carritoActual.items = carritoActual.items.filter(item => 
        item.producto.producto_id !== productoId
      );
      this.actualizarTotal(carritoActual);
    }
  }

  /**
   * Actualizar cantidad de un producto
   */
  actualizarCantidad(productoId: number, cantidad: number): void {
    const token = this.obtenerToken();
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.items.find(i => i.producto.producto_id === productoId);

    if (cantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    if (token && item && (item as any).detalle_carrito_id) {
      // Usuario autenticado: usar backend
      this.http.put<any>(`${this.urlApi}/carrito/detalle/${(item as any).detalle_carrito_id}`, {
        cantidad: cantidad
      }).subscribe({
        next: (respuesta) => {
          const carritoBackend = this.convertirCarritoBackend(respuesta.data);
          this.carritoSubject.next(carritoBackend);
        },
        error: (error) => {
          console.error('Error al actualizar cantidad:', error);
        }
      });
    } else {
      // Usuario invitado: usar localStorage
      if (item) {
        item.cantidad = cantidad;
        this.actualizarTotal(carritoActual);
      }
    }
  }

  /**
   * Actualizar total del carrito
   */
  private actualizarTotal(carrito: Carrito): void {
    carrito.total = carrito.items.reduce((sum, item) => 
      sum + ((item.producto.precio_unitario ?? item.producto.precio_producto ?? 0) * item.cantidad), 0
    );
    this.carritoSubject.next(carrito);
    this.guardarCarritoLocal();
  }

  /**
   * Limpiar carrito completo
   */
  limpiarCarrito(): void {
    const token = this.obtenerToken();

    if (token) {
      // Usuario autenticado: vaciar en backend
      this.http.delete<any>(`${this.urlApi}/carrito/vaciar`).subscribe({
        next: () => {
          this.carritoSubject.next({ items: [], total: 0 });
        },
        error: (error) => {
          console.error('Error al vaciar carrito:', error);
        }
      });
    } else {
      // Usuario invitado: limpiar localStorage
      this.carritoSubject.next({ items: [], total: 0 });
      this.guardarCarritoLocal();
    }
  }

  /**
   * Obtener cantidad total de items
   */
  obtenerCantidadTotal(): number {
    return this.carritoSubject.value.items.reduce((sum, item) => sum + item.cantidad, 0);
  }
}