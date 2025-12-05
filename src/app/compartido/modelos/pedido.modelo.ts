import { Producto } from './producto.modelo';

export interface ItemPedido {
  detalle_venta_id?: number;
  producto_id?: number;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

export interface Pedido {
  id?: number;
  venta_id?: number; // Para backend
  numero_venta?: string; // ⭐ NUEVO - Número de venta formateado (V-000001)
  usuario_id?: number;
  cliente_id?: number;
  cliente?: any; // ⭐ NUEVO - Datos del cliente
  fecha_pedido?: string;
  fecha_venta?: string; // Para backend
  fecha_venta_formato?: string; // ⭐ NUEVO - Fecha formateada (dd/mm/yyyy)
  estado: 'Pendiente' | 'Confirmado' | 'En Proceso' | 'Enviado' | 'Entregado' | 'Completado' | 'Cancelado' | 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  estado_venta?: string;
  total: number;
  total_venta?: number;
  subtotal?: number; // ⭐ NUEVO
  descuento?: number; // ⭐ NUEVO
  items?: ItemPedido[];
  productos?: any[]; // ⭐ NUEVO - Productos en formato backend
  detalles?: any[]; // Para backend
  direccion_envio?: string;
  telefono_contacto?: string;
  metodo_pago?: string;
  canal_venta?: string; // ⭐ NUEVO - Canal de venta (Web, WhatsApp, etc.)
  codigo_operacion?: string;
  comprobante_pago?: string;
  observaciones?: string; // ⭐ NUEVO - Observaciones del pedido
}