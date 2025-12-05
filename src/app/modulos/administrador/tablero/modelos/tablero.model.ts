export interface EstadisticasTarjeta {
  icono: string;
  titulo: string;
  valor: string | number;
  cambio: number;
  tipo: 'positivo' | 'negativo' | 'neutral';
  descripcion: string;
}

export interface VentaDiaria {
  fecha: string;
  total: number;
}

export interface ProductoStock {
  id: number;
  nombre: string;
  codigo: string;
  stock: number;
  stockMinimo: number;
  estado: 'critico' | 'bajo' | 'normal';
}

export interface VentaReciente {
  id: number;
  numero: string;
  fecha: string;
  cliente: string;
  total: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
}

export interface ProductoTop {
  id: number;
  nombre: string;
  cantidadVendida: number;
  imagen?: string;
}

export interface DashboardData {
  estadisticas: {
    ventasHoy: number;
    ventasMes: number;
    ticketPromedio: number;
    productosStockBajo: number;
  };
  ventasSemana: VentaDiaria[];
  alertasStock: ProductoStock[];
  ventasRecientes: VentaReciente[];
  topProductos: ProductoTop[];
}