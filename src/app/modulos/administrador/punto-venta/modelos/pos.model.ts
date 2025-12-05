import { Producto } from '../../productos/modelos/producto.model';

/**
 * Cliente según la base de datos
 */
export interface Cliente {
  cliente_id: number;
  nombre_clie: string;
  nombre_cliente?: string;  
  dni?: string;              
  telefono: string;
  email?: string;
  direccion?: string;
  contacto_clie?: string;
  contacto_cliente?: string;
  preferencias_clie?: string;
  preferencias_cliente?: string;
  historial_compras?: string;
  fecha_registro?: string;
}

/**
 * Item individual en el carrito
 */
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento?: number;
}

/**
 * Estructura del carrito de compras
 */
export interface CarritoPOS {
  items: ItemCarrito[];
  subtotal: number;
  descuento_total: number;
  total: number;
  cantidad_items: number;
}

/**
 * Métodos de pago disponibles
 */
export type MetodoPago = 'Efectivo' | 'Yape' | 'Plin' | 'Transferencia';

/**
 * Canales de venta disponibles
 */
export type CanalVenta =
  | 'Tienda física'
  | 'WhatsApp'
  | 'Redes sociales'
  | 'Teléfono'
  | 'Otro';

/**
 * Solicitud de venta para enviar al backend
 */
export interface SolicitudVenta {
  cliente_id: number;
  items: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
  metodo_pago: MetodoPago;
  canal_venta: CanalVenta;
  observaciones?: string;
  descuento?: number;
}

/**
 * Respuesta del backend al crear venta
 */
export interface RespuestaVenta {
  success: boolean;
  message: string;
  data: {
    venta_id: number;
    numero_venta: string;
    total: number;
    fecha_venta: string;
  };
}

/**
 * Estado completo del POS
 */
export interface EstadoPOS {
  carrito: CarritoPOS;
  cliente_seleccionado: Cliente | null;
  metodo_pago: MetodoPago | null;
  canal_venta: CanalVenta | null;
  observaciones: string;
  procesando_venta: boolean;
}

/**
 * Tipo de descuento
 */
export interface Descuento {
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
}

/**
 * Parámetros de búsqueda de productos
 */
export interface BusquedaProducto {
  termino?: string;
  tipo?: string;
  color?: string;
  en_stock?: boolean;
}

/**
 * Respuesta de búsqueda de cliente
 */
export interface RespuestaCliente {
  success: boolean;
  message?: string;
  data: Cliente | null;
}

/**
 * Solicitud de creación de cliente
 */
export interface SolicitudCliente {
  nombre: string;
  dni?: string;      // ⭐ ESTA LÍNEA ES LA QUE FALTA
  telefono: string;
  email?: string;
  direccion?: string;
}