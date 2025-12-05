/**
 * Interfaz principal de Proveedor
 */
export interface Proveedor {
  proveedor_id: number;
  nombre: string;
  contacto?: string; // Nombre de la persona de contacto
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_registro: string;
  
  // Campos calculados (opcionales)
  total_productos?: number;
  ultima_compra?: string;
  productos_suministrados?: string[]; // Nombres de productos
}

export interface RespuestaProveedores {
  success: boolean;
  data: {
    data: Proveedor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | Proveedor[];
}

/**
 * Respuesta de un solo proveedor
 */
export interface RespuestaProveedor {
  success: boolean;
  data: Proveedor;
  message?: string;
}

/**
 * Filtros para búsqueda de proveedores
 */
export interface FiltrosProveedor {
  busqueda?: string; // Nombre, contacto, teléfono
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  por_pagina?: number;
}

/**
 * DTO para crear proveedor
 */
export interface CrearProveedorDTO {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

/**
 * DTO para actualizar proveedor
 */
export interface ActualizarProveedorDTO {
  nombre?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

/**
 * Producto suministrado por proveedor
 */
export interface ProductoProveedor {
  producto_id: number;
  codigo_lana: string;
  nombre: string;
  tipo_lana: string;
  stock_actual: number;
  precio: number;
}

/**
 * Respuesta de productos de un proveedor
 */
export interface RespuestaProductosProveedor {
  success: boolean;
  data: ProductoProveedor[];
}

/**
 * Estadísticas de proveedores
 */
export interface EstadisticasProveedores {
  total_proveedores: number;
  proveedores_activos: number;
  proveedores_nuevos_mes: number;
  top_proveedores: TopProveedor[];
}

/**
 * Top proveedor
 */
export interface TopProveedor {
  proveedor_id: number;
  nombre: string;
  total_productos: number;
  productos_nombres: string[];
}

/**
 * Respuesta de estadísticas
 */
export interface RespuestaEstadisticasProveedores {
  success: boolean;
  data: EstadisticasProveedores;
}