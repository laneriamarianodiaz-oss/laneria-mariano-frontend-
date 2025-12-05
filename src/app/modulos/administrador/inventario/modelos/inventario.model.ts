export interface ProductoInventario {
  id: number;
  codigo_lana: string;
  nombre: string;
  categoria: string;
  tipo_lana: string;
  color: string;
  stock: number;
  stock_minimo: number;
  stock_maximo?: number;
  precio_unitario: number;
  valor_total: number;
  estado_stock: 'critico' | 'bajo' | 'normal' | 'exceso';
  ultima_actualizacion?: string;
}

export interface MovimientoStock {
  id: number;
  producto_id: number;
  producto_nombre: string;
  producto_codigo: string;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string;
  usuario_id?: number;
  usuario_nombre?: string;
  fecha: string;
  referencia?: string;
}

export interface AjusteStock {
  producto_id: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  cantidad: number;
  motivo: string;
  referencia?: string;
}

export interface EstadisticasInventario {
  total_productos: number;
  valor_total_inventario: number;
  productos_stock_critico: number;
  productos_stock_bajo: number;
  productos_stock_normal: number;
  productos_exceso: number;
  movimientos_hoy: number;
  movimientos_mes: number;
}

export interface FiltrosInventario {
  busqueda?: string;
  categoria?: string;
  estado_stock?: string;
  orden?: 'nombre' | 'stock' | 'valor';
  direccion?: 'asc' | 'desc';
}

export const TIPOS_MOVIMIENTO = [
  { valor: 'entrada', texto: 'Entrada', icono: '📥', color: '#27ae60' },
  { valor: 'salida', texto: 'Salida', icono: '📤', color: '#e74c3c' },
  { valor: 'ajuste', texto: 'Ajuste', icono: '🔧', color: '#f39c12' },
  { valor: 'devolucion', texto: 'Devolución', icono: '↩️', color: '#3498db' }
];

export const ESTADOS_STOCK = [
  { valor: 'critico', texto: 'Crítico', color: '#e74c3c', desde: 0, hasta: 'min' },
  { valor: 'bajo', texto: 'Bajo', color: '#f39c12', desde: 'min', hasta: 'min*1.5' },
  { valor: 'normal', texto: 'Normal', color: '#27ae60', desde: 'min*1.5', hasta: 'max' },
  { valor: 'exceso', texto: 'Exceso', color: '#3498db', desde: 'max', hasta: null }
];