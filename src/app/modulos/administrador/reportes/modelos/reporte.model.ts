// ===================================
// INTERFACE COMÚN PARA VISTA DE VENTAS
// ===================================

/**
 * Interfaz común para unificar VentaPorMetodoPago y VentaPorCanal
 * Permite usar un solo tipo en los componentes que muestran ambas vistas
 */
export interface ItemVenta {
  metodo_pago?: string;
  canal?: string;
  cantidad_ventas: number;
  total_ventas: number;
  porcentaje: number;
}

// ===================================
// ESTADÍSTICAS GENERALES DEL DASHBOARD
// ===================================

/**
 * Estadísticas principales mostradas en el dashboard
 * Incluye métricas de ventas, clientes, productos y pedidos
 */
export interface EstadisticasGenerales {
  ventas_hoy: number;
  ventas_mes: number;
  ventas_ano: number;
  total_clientes: number;
  total_productos: number;
  productos_stock_bajo: number;
  pedidos_pendientes: number;
  ticket_promedio: number;
}

/**
 * Respuesta del endpoint de estadísticas generales
 */
export interface RespuestaEstadisticasGenerales {
  success: boolean;
  data: EstadisticasGenerales;
}

// ===================================
// VENTAS POR PERÍODO
// ===================================

/**
 * Representa las ventas de un día específico
 */
export interface VentaPorDia {
  fecha: string;
  total_ventas: number;
  cantidad_pedidos: number;
  ticket_promedio: number;
}

/**
 * Ventas agrupadas por período (día, semana, mes)
 */
export interface VentasPorPeriodo {
  fecha_inicio: string;
  fecha_fin: string;
  total_ventas: number;
  cantidad_pedidos: number;
  ticket_promedio: number;
  ventas_por_dia: VentaPorDia[];
}

/**
 * Respuesta del endpoint de ventas por período
 */
export interface RespuestaVentasPorPeriodo {
  success: boolean;
  data: VentasPorPeriodo;
}

// ===================================
// PRODUCTOS MÁS VENDIDOS
// ===================================

/**
 * Información de un producto más vendido
 */
export interface ProductoMasVendido {
  producto_id: number;
  codigo_lana: string;
  nombre: string;
  tipo_lana: string;
  cantidad_vendida: number;
  total_ingresos: number;
  precio_promedio: number;
}

/**
 * Respuesta del endpoint de productos más vendidos
 */
export interface RespuestaProductosMasVendidos {
  success: boolean;
  data: ProductoMasVendido[];
}

// ===================================
// VENTAS POR MÉTODO DE PAGO
// ===================================

/**
 * Distribución de ventas por método de pago
 */
export interface VentaPorMetodoPago {
  metodo_pago: string;
  cantidad_ventas: number;
  total_ventas: number;
  porcentaje: number;
}

/**
 * Respuesta del endpoint de ventas por método de pago
 */
export interface RespuestaVentasPorMetodoPago {
  success: boolean;
  data: VentaPorMetodoPago[];
}

// ===================================
// VENTAS POR CANAL
// ===================================

/**
 * Distribución de ventas por canal (tienda, online, whatsapp, etc.)
 */
export interface VentaPorCanal {
  canal: string;
  cantidad_ventas: number;
  total_ventas: number;
  porcentaje: number;
}

/**
 * Respuesta del endpoint de ventas por canal
 */
export interface RespuestaVentasPorCanal {
  success: boolean;
  data: VentaPorCanal[];
}

// ===================================
// ESTADÍSTICAS DE INVENTARIO
// ===================================

/**
 * Información de un producto con stock bajo
 */
export interface ProductoStockBajo {
  producto_id: number;
  codigo_lana: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  diferencia: number;
}

/**
 * Estadísticas generales del inventario
 */
export interface EstadisticasInventario {
  total_productos: number;
  productos_activos: number;
  productos_stock_bajo: number;
  productos_sin_stock: number;
  valor_total_inventario: number;
  productos_stock_bajo_lista: ProductoStockBajo[];
}

/**
 * Respuesta del endpoint de estadísticas de inventario
 */
export interface RespuestaEstadisticasInventario {
  success: boolean;
  data: EstadisticasInventario;
}

// ===================================
// ESTADÍSTICAS DE CLIENTES
// ===================================

/**
 * Información de un cliente top
 */
export interface ClienteTop {
  cliente_id: number;
  nombre: string;
  telefono: string;
  total_compras: number;
  total_gastado: number;
  ultima_compra: string;
}

/**
 * Estadísticas generales de clientes
 */
export interface EstadisticasClientes {
  total_clientes: number;
  clientes_activos: number;
  clientes_nuevos_mes: number;
  clientes_frecuentes: number;
  top_clientes: ClienteTop[];
}

/**
 * Respuesta del endpoint de estadísticas de clientes
 */
export interface RespuestaEstadisticasClientes {
  success: boolean;
  data: EstadisticasClientes;
}

// ===================================
// FILTROS Y EXPORTACIÓN
// ===================================

/**
 * Filtros para consultas de reportes
 */
export interface FiltrosReporte {
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_reporte?: string;
  agrupar_por?: 'dia' | 'semana' | 'mes';
  top?: number;
}

/**
 * Opciones para exportación de reportes
 */
export interface OpcionesExportacion {
  tipo: 'pdf' | 'excel';
  nombre_archivo?: string;
  incluir_graficos?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

/**
 * Respuesta del endpoint de exportación
 */
export interface RespuestaExportacion {
  success: boolean;
  message: string;
  url?: string;
}