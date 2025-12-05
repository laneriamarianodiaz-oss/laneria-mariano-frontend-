export const API_ENDPOINTS = {
  
  // ========================================
  // AUTENTICACIÓN
  // ========================================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTRO: '/auth/registro',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PERFIL: '/auth/perfil',
    ME: '/auth/me', // ✅ AGREGADO
    CAMBIAR_PASSWORD: '/auth/cambiar-password',
    RECUPERAR_PASSWORD: '/auth/recuperar-password',
    VALIDAR_TOKEN: '/auth/validar-token'
  } as const,

  // ========================================
  // USUARIOS
  // ========================================
  USUARIOS: {
    BASE: '/usuarios',
    DETALLE: (id: number) => `/usuarios/${id}`,
    CREAR: '/usuarios',
    ACTUALIZAR: (id: number) => `/usuarios/${id}`,
    ELIMINAR: (id: number) => `/usuarios/${id}`,
    CAMBIAR_ESTADO: (id: number) => `/usuarios/${id}/estado`,
    CAMBIAR_ROL: (id: number) => `/usuarios/${id}/rol`
  } as const,

  // ========================================
  // PRODUCTOS
  // ========================================
  PRODUCTOS: {
    BASE: '/productos',
    DETALLE: (id: number) => `/productos/${id}`,
    CREAR: '/productos',
    ACTUALIZAR: (id: number) => `/productos/${id}`,
    ELIMINAR: (id: number) => `/productos/${id}`,
    BUSCAR: '/productos/buscar',
    POR_CATEGORIA: (categoria: string) => `/productos/categoria/${categoria}`,
    POR_CODIGO: (codigo: string) => `/productos/codigo/${codigo}`,
    STOCK_BAJO: '/productos/stock-bajo',
    SIN_STOCK: '/productos/sin-stock',
    SUBIR_IMAGEN: (id: number) => `/productos/${id}/imagen`,
    CATEGORIAS: '/productos/categorias',
    TIPOS_LANA: '/productos/tipos-lana',
    TIPOS: '/productos/tipos', // ✅ AGREGADO
    COLORES: '/productos/colores'
  } as const,

  // ========================================
  // INVENTARIO
  // ========================================
  INVENTARIO: {
    BASE: '/inventario',
    RESUMEN: '/inventario/resumen/general',
    ESTADISTICAS: '/inventario/estadisticas', // ✅ AGREGADO
    ALERTAS_STOCK_BAJO: '/inventario/alertas/stock-bajo',
    SIN_STOCK: '/inventario/alertas/sin-stock',
    DETALLE: (productoId: number) => `/inventario/productos/${productoId}`,
    ACTUALIZAR_STOCK: (productoId: number) => `/inventario/productos/${productoId}/stock`,
    AJUSTAR_STOCK: '/inventario/ajustar-stock', // ✅ AGREGADO
    HISTORIAL_MOVIMIENTOS: '/inventario/movimientos', // ✅ AGREGADO
    HISTORIAL_POR_PRODUCTO: (productoId: number) => `/inventario/movimientos/producto/${productoId}`,
    AGREGAR_MOVIMIENTO: '/inventario/movimientos',
    PRODUCTOS_CRITICOS: '/inventario/alertas/criticos',
    VALOR_TOTAL: '/inventario/valor-total'
  } as const,

  // ========================================
  // VENTAS
  // ========================================
  VENTAS: {
    BASE: '/ventas',
    DETALLE: (id: number) => `/ventas/${id}`,
    CREAR: '/ventas',
    ACTUALIZAR: (id: number) => `/ventas/${id}`,
    ANULAR: (id: number) => `/ventas/${id}/anular`,
    CAMBIAR_ESTADO: (id: number) => `/ventas/${id}/estado`,
    POR_FECHA: '/ventas/por-fecha',
    POR_CLIENTE: (clienteId: number) => `/ventas/cliente/${clienteId}`,
    ESTADISTICAS: '/ventas/estadisticas',
    RESUMEN_DIARIO: '/ventas/resumen/diario',
    RESUMEN_MENSUAL: '/ventas/resumen/mensual',
    IMPRIMIR_COMPROBANTE: (id: number) => `/ventas/${id}/comprobante`
  } as const,

  // ========================================
  // CLIENTES
  // ========================================
  CLIENTES: {
    BASE: '/clientes',
    DETALLE: (id: number) => `/clientes/${id}`,
    CREAR: '/clientes',
    ACTUALIZAR: (id: number) => `/clientes/${id}`,
    ELIMINAR: (id: number) => `/clientes/${id}`,
    BUSCAR: '/clientes/buscar',
    POR_DOCUMENTO: (documento: string) => `/clientes/documento/${documento}`,
    HISTORIAL_COMPRAS: (id: number) => `/clientes/${id}/compras`,
    CLIENTES_FRECUENTES: '/clientes/frecuentes',
    ESTADISTICAS: (id: number) => `/clientes/${id}/estadisticas`
  } as const,

  // ========================================
  // PROVEEDORES
  // ========================================
  PROVEEDORES: {
    BASE: '/proveedores',
    DETALLE: (id: number) => `/proveedores/${id}`,
    CREAR: '/proveedores',
    ACTUALIZAR: (id: number) => `/proveedores/${id}`,
    ELIMINAR: (id: number) => `/proveedores/${id}`,
    PRODUCTOS: (id: number) => `/proveedores/${id}/productos`,
    HISTORIAL_COMPRAS: (id: number) => `/proveedores/${id}/compras`
  } as const,

  // ========================================
  // PUNTO DE VENTA (POS)
  // ========================================
  POS: {
    BUSCAR_PRODUCTO: '/pos/buscar-producto',
    BUSCAR_CLIENTE: '/pos/buscar-cliente',
    PROCESAR_VENTA: '/pos/procesar-venta',
    CALCULAR_TOTAL: '/pos/calcular-total',
    APLICAR_DESCUENTO: '/pos/aplicar-descuento',
    METODOS_PAGO: '/pos/metodos-pago'
  } as const,

  // ========================================
  // REPORTES
  // ========================================
  REPORTES: {
    DASHBOARD: '/reportes/dashboard', // ✅ AGREGADO
    VENTAS_POR_PERIODO: '/reportes/ventas/periodo',
    VENTAS_POR_PRODUCTO: '/reportes/ventas/producto',
    VENTAS_POR_CATEGORIA: '/reportes/ventas/categoria',
    PRODUCTOS_MAS_VENDIDOS: '/reportes/productos/mas-vendidos',
    CLIENTES_TOP: '/reportes/clientes/top',
    INVENTARIO_VALORIZADO: '/reportes/inventario/valorizado',
    MOVIMIENTOS_STOCK: '/reportes/inventario/movimientos',
    RESUMEN_GENERAL: '/reportes/resumen/general',
    EXPORTAR_EXCEL: '/reportes/exportar/excel',
    EXPORTAR_PDF: '/reportes/exportar/pdf'
  } as const,

  // ========================================
  // DASHBOARD / TABLERO
  // ========================================
  DASHBOARD: {
    ESTADISTICAS_GENERALES: '/dashboard/estadisticas',
    VENTAS_RECIENTES: '/dashboard/ventas-recientes',
    PRODUCTOS_STOCK_BAJO: '/dashboard/alertas/stock-bajo',
    GRAFICO_VENTAS_SEMANA: '/dashboard/graficos/ventas-semana',
    GRAFICO_VENTAS_MES: '/dashboard/graficos/ventas-mes',
    TOP_PRODUCTOS: '/dashboard/top-productos',
    RESUMEN_DIA: '/dashboard/resumen/dia'
  } as const,

  // ========================================
  // CONFIGURACIÓN
  // ========================================
  CONFIGURACION: {
    GENERAL: '/configuracion/general',
    ACTUALIZAR: '/configuracion/actualizar',
    EMPRESA: '/configuracion/empresa',
    COMPROBANTES: '/configuracion/comprobantes',
    IMPRESORA: '/configuracion/impresora',
    BACKUP: '/configuracion/backup',
    RESTAURAR: '/configuracion/restaurar'
  } as const,

  // ========================================
  // NOTIFICACIONES
  // ========================================
  NOTIFICACIONES: {
    BASE: '/notificaciones',
    NO_LEIDAS: '/notificaciones/no-leidas',
    MARCAR_LEIDA: (id: number) => `/notificaciones/${id}/leida`,
    MARCAR_TODAS_LEIDAS: '/notificaciones/marcar-todas-leidas',
    ELIMINAR: (id: number) => `/notificaciones/${id}`
  } as const

} as const;

// Tipo para autocompletado y validación
export type ApiEndpoints = typeof API_ENDPOINTS;