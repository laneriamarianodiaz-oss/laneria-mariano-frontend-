/**
 * Modelo de Pedido Online
 * Sistema de Stock y Ventas - Lanería Mariano Díaz
 */

export type EstadoPedidoOnline =
  | 'Pendiente'
  | 'Confirmado'
  | 'En preparación'
  | 'Listo para entrega'
  | 'Entregado'
  | 'Cancelado';

export interface ItemPedidoOnline {
  producto_id: number;
  producto: {
    id: number;
    nombre: string;
    precio_unitario: number;
    imagen_url?: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoOnline {
  pedido_id: number;
  numero_pedido: string;
  cliente_id?: number;
  cliente: {
    nombre: string;
    telefono: string;
    email?: string;
    direccion?: string;
  };
  items: ItemPedidoOnline[];
  subtotal: number;
  total: number;
  metodo_pago: 'Efectivo' | 'Efectivo contra entrega' | 'Yape' | 'Plin' | 'Transferencia';
  estado: EstadoPedidoOnline;
  observaciones?: string;
  fecha_pedido: string;
  fecha_actualizacion?: string;
  comprobante_pago?: string;
}

export interface RespuestaPedidosOnline {
  success: boolean;
  data: PedidoOnline[];
  total: number;
}

export interface ActualizarEstadoPedido {
  pedido_id: number;
  estado: EstadoPedidoOnline;
  observaciones?: string;
}

export interface RespuestaActualizacionPedido {
  success: boolean;
  message: string;
  data: PedidoOnline;
}

export interface FiltrosPedidosOnline {
  estado?: EstadoPedidoOnline;
  fecha_desde?: string;
  fecha_hasta?: string;
  metodo_pago?: string;
}