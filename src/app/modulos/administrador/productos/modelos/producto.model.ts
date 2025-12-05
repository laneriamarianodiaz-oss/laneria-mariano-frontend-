// Re-exportar el modelo único desde compartido
export type { Producto } from '../../../../compartido/modelos/producto.modelo';
export { mapearProductoBackend } from '../../../../compartido/modelos/producto.modelo';

// Importar Producto para usarlo en las interfaces locales
import type { Producto } from '../../../../compartido/modelos/producto.modelo';

// Interfaces adicionales para el admin
export interface ProductoFormulario {
  codigo_lana: string;
  nombre: string;
  tipo_lana: string;
  categoria: string;
  color: string;
  talla_tamano?: string;
  precio_unitario: number;
  stock: number;
  stock_minimo: number;
  proveedor_id?: number;
  estado: string;
  descripcion?: string;
}

export interface FiltrosProducto {
  busqueda?: string;
  buscar?: string;
  categoria?: string;
  tipo_lana?: string;
  color?: string;
  estado?: string;
  stock_bajo?: boolean;
}

export interface PaginacionProductos {
  data: Producto[];
  current_page: number;
  last_page: number;
  per_page: number; 
  total: number;
}

export const CATEGORIAS = [
  'Lanas',
  'Cahuas',
  'Amigurumis',
  'Ropas',
  'Accesorios',
  'Kits'
];

export const TIPOS_LANA = [
  'Perlita domino',
  'Silvia Clásica',
  'Alpaca',
  'Merino'
];

export const COLORES = [
  'Blanco',
  'Negro',
  'Rojo',
  'Azul',
  'Verde',
  'Amarillo',
  'Rosa',
  'Morado',
  'Naranja',
  'Café',
  'Gris',
  'Dorado',
  'Plateado',
  'Piel'
];