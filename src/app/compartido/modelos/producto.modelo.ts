/**
 * Modelo unificado de Producto
 * Compatible con Backend Laravel y Frontend Angular
 */
export interface Producto {
  // IDs
  id: number;
  producto_id?: number;
  codigo_producto?: string;

  // Información básica
  codigo_lana: string;
  nombre: string;
  nombre_produc?: string;
  nombre_producto?: string;

  // Clasificación
  tipo_lana: string;
  tipo_de_producto?: string;
  categoria: string;
  color: string;
  color_producto?: string;
  talla_tamano?: string;
  talla_producto?: string;

  // Precios y Stock
  precio_unitario: number;
  precio?: number;
  precio_producto?: number;
  stock: number;
  stock_disponible?: number;
  stock_actual?: number;
  stock_minimo: number;

  // Proveedor
  proveedor_id?: number | null;

  // Estado y descripción
  estado: string;
  estado_producto?: string;
  descripcion?: string;

  // Imágenes
  imagenes?: string[];
  imagen_url?: string | null;

  // Fechas
  created_at?: string;
  updated_at?: string;
  fecha_creacion?: string;
}

/**
 * Mapea la respuesta del backend Laravel al modelo frontend
 */
export function mapearProductoBackend(productoBackend: any): Producto {

  const productoMapeado: Producto = {
    // IDs
    id: productoBackend.producto_id || productoBackend.id,
    producto_id: productoBackend.producto_id,
    
    // ✅ CÓDIGO - PRIORIDAD AL CÓDIGO_PRODUCTO
    codigo_producto: productoBackend.codigo_producto,
    codigo_lana: productoBackend.codigo_producto || productoBackend.codigo_lana || '',
    
    // ✅ NOMBRE - MAPEO CORRECTO
    nombre: productoBackend.nombre_producto || productoBackend.nombre_produc || productoBackend.nombre || '',
    nombre_produc: productoBackend.nombre_producto,
    nombre_producto: productoBackend.nombre_producto,
    
    // Tipo
    tipo_lana: productoBackend.tipo_de_producto || '',
    tipo_de_producto: productoBackend.tipo_de_producto,
    
    // Categoría
    categoria: productoBackend.categoria || '',
    
    // Color
    color: productoBackend.color_producto || '',
    color_producto: productoBackend.color_producto,
    
    // Talla
    talla_tamano: productoBackend.talla_producto,
    talla_producto: productoBackend.talla_producto,
    
    // ✅ PRECIO - Acepta tanto precio_unitario como precio_producto del backend
    precio_unitario: Number(productoBackend.precio_unitario || productoBackend.precio_producto) || 0,
    precio: Number(productoBackend.precio_unitario || productoBackend.precio_producto) || 0,
    precio_producto: Number(productoBackend.precio_unitario || productoBackend.precio_producto),
    
    // Stock
    stock: productoBackend.stock_disponible || 0,
    stock_disponible: productoBackend.stock_disponible,
    stock_actual: productoBackend.stock_disponible,
    stock_minimo: productoBackend.stock_minimo || 0,
    
    // Proveedor
    proveedor_id: productoBackend.proveedor_id,
    
    // Estado - NORMALIZAR A MINÚSCULAS
    estado: (productoBackend.estado_producto === 'Activo' || productoBackend.estado === 'activo') ? 'activo' : 'inactivo',
    estado_producto: productoBackend.estado_producto,
    
    // Descripción
    descripcion: productoBackend.descripcion,
    
    // Imágenes
    imagenes: productoBackend.imagenes || [],
    imagen_url: productoBackend.imagen_url,
    
    // Fechas
    created_at: productoBackend.fecha_creacion || productoBackend.created_at,
    updated_at: productoBackend.updated_at,
    fecha_creacion: productoBackend.fecha_creacion
  };

  return productoMapeado;
}