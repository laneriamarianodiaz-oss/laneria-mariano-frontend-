/**
 * Modelo de Venta
 * Sistema de Stock y Ventas - Lanería Mariano Díaz
 */

export type EstadoVenta = 'Pendiente' | 'Completada' | 'Cancelada';
export type MetodoPago = 'Efectivo' | 'Yape' | 'Plin' | 'Transferencia';
export type CanalVenta = 'Tienda física' | 'WhatsApp' | 'Redes sociales' | 'Teléfono' | 'Otro';

export interface DetalleVenta {
  detalle_venta_id: number;
  venta_id: number;
  producto_id: number;
  producto: {
    id: number;
    nombre: string;
    codigo_lana?: string;
    tipo_lana?: string;
    color?: string;
    talla_tamano?: string;
    imagen_url?: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  venta_id: number;
  numero_venta: string;
  cliente_id?: number;
  cliente?: {
    cliente_id: number;
    nombre_clie: string;
    telefono: string;
    email?: string;
    direccion?: string;
  };
  fecha_venta: string;
  estado_venta: EstadoVenta;
  total_venta: number;
  metodo_pago: MetodoPago;
  canal_venta?: CanalVenta;
  observaciones?: string;
  descuento?: number;
  subtotal?: number;
  detalles: DetalleVenta[];
  comprobante?: {
    comprobante_id: number;
    numero_comprobante: string;
    tipo_comprobante: 'Boleta' | 'Factura' | 'Recibo';
    url_pdf?: string;
  };
  usuario_registro?: {
    id: number;
    nombre: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface RespuestaVentas {
  success: boolean;
  data: {
    data: Venta[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | Venta[];
}

export interface RespuestaVenta {
  success: boolean;
  data: Venta;
  message?: string;
}

export interface FiltrosVenta {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoVenta;
  metodo_pago?: MetodoPago;
  canal_venta?: CanalVenta;
  cliente_id?: number;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}

export interface EstadisticasVentas {
  ventas_hoy: {
    cantidad: number;
    total: number;
  };
  ventas_semana: {
    cantidad: number;
    total: number;
  };
  ventas_mes: {
    cantidad: number;
    total: number;
  };
  ventas_por_estado: {
    pendientes: number;
    completadas: number;
    canceladas: number;
  };
  ventas_por_metodo_pago: {
    [key: string]: number;
  };
  ventas_por_canal: {
    [key: string]: number;
  };
  productos_mas_vendidos: {
    producto_id: number;
    nombre: string;
    cantidad_vendida: number;
    total_generado: number;
  }[];
  ticket_promedio: number;
}

export interface ActualizarEstadoVenta {
  venta_id: number;
  estado_venta: EstadoVenta;
  observaciones?: string;
}