/**
 * Modelo de datos para el módulo de Clientes
 */

export interface Cliente {
  cliente_id: number;
  nombre_cliente: string;
  contacto_cliente?: string;
  telefono: string;
  email?: string;
  direccion?: string;
  preferencias_cliente?: string;
  historial_compras?: string;
  fecha_registro: string;
  total_compras?: number;
  cantidad_compras?: number;
  ultima_compra?: string;
}

export interface RespuestaClientes {
  success: boolean;
  data: {
    data: Cliente[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | Cliente[];
}

export interface RespuestaCliente {
  success: boolean;
  data: Cliente;
  message?: string;
}

export interface FiltrosCliente {
  busqueda?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  por_pagina?: number;
}

export interface CrearClienteDTO {
  nombre_cliente: string;
  telefono: string;
  email?: string;
  direccion?: string;
  contacto_cliente?: string;
  preferencias_cliente?: string;
}

export interface ActualizarClienteDTO {
  nombre_cliente?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contacto_cliente?: string;
  preferencias_cliente?: string;
}

// ✅ MODELO CORRECTO DEL HISTORIAL
export interface HistorialComprasCliente {
  venta_id: number;
  numero_venta: string;
  fecha_venta: string;
  total: number;                    // ← ERA "total_venta", ahora "total"
  estado_venta: string;
  metodo_pago: string;              // ← AGREGADO
  productos: ProductoHistorial[];   // ← CAMBIADO el tipo
}

// ✅ NUEVO: Interfaz para productos del historial
export interface ProductoHistorial {
  producto_id: number;      // ← AGREGADO (para el track)
  nombre: string;           // ← ERA "nombre_producto", ahora "nombre"
  cantidad: number;
  precio_unitario: number;
  subtotal: number;         // ← AGREGADO
}

export interface EstadisticasCliente {
  total_clientes: number;
  clientes_nuevos_mes: number;
  clientes_activos: number;
  top_clientes: {
    cliente_id: number;
    nombre_cliente: string;
    total_compras: number;
    cantidad_compras: number;
  }[];
}