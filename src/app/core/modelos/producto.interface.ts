export interface Producto {
  producto_id: number;
  nombre_producto: string;
  tipo_de_producto: string;
  color_producto: string | null;
  talla_producto: string | null;
  precio_producto: number;
  stock_disponible: number;
  descripcion: string | null;
  imagen_url: string | null;
  proveedor_id: number | null;
  estado_producto: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
  tiene_stock?: boolean;
}

export interface ProductoResponse {
  success: boolean;
  message: string | null;
  data: {
    current_page: number;
    data: Producto[];
    total: number;
  };
}