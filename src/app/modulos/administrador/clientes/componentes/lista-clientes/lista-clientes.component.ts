import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../servicios/cliente.service';
import { Cliente, FiltrosCliente, HistorialComprasCliente } from '../../modelos/cliente.model';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css'],
})
export class ListaClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);

  // Signals del servicio
  readonly clientes = this.clienteService.clientes;
  readonly estadisticas = this.clienteService.estadisticas;
  readonly cargando = this.clienteService.cargando;
  readonly totalRegistros = this.clienteService.totalRegistros;
  readonly paginaActual = this.clienteService.paginaActual;
  readonly totalPaginas = this.clienteService.totalPaginas;
  readonly historialCompras = this.clienteService.historialCompras;

  // Estados locales
  mostrarFiltros = false;
  mostrarEstadisticas = false; // ❌ DESACTIVADO por error en backend
  
  // Modal de historial
  mostrarModalHistorial = false;
  clienteSeleccionado: Cliente | null = null;
  cargandoHistorial = false;

  // Filtros
  busqueda = '';
  fechaDesde = '';
  fechaHasta = '';
  filtrosActuales: FiltrosCliente = {};

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar datos iniciales
   */
  cargarDatos(): void {
    this.clienteService.obtenerClientes(this.filtrosActuales).subscribe();
    // ❌ DESACTIVADO: this.clienteService.obtenerEstadisticas().subscribe();
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    const filtros: FiltrosCliente = {
      busqueda: this.busqueda || undefined,
      fecha_desde: this.fechaDesde || undefined,
      fecha_hasta: this.fechaHasta || undefined,
      pagina: 1,
    };

    this.filtrosActuales = filtros;
    this.clienteService.obtenerClientes(filtros).subscribe();
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.filtrosActuales = {};
    this.clienteService.obtenerClientes().subscribe();
  }

  /**
   * Ver historial del cliente
   */
  verDetalle(clienteId: number): void {
    const cliente = this.clientes().find(c => c.cliente_id === clienteId);
    if (!cliente) return;

    this.clienteSeleccionado = cliente;
    this.mostrarModalHistorial = true;
    this.cargandoHistorial = true;

    // Cargar historial de compras
    this.clienteService.obtenerHistorialCompras(clienteId).subscribe({
      next: () => {
        this.cargandoHistorial = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.cargandoHistorial = false;
        alert('❌ No se pudo cargar el historial de compras');
      }
    });
  }

  /**
   * Cerrar modal de historial
   */
  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.clienteSeleccionado = null;
    this.clienteService.limpiarClienteSeleccionado();
  }

  /**
   * Crear nuevo cliente
   */
  crearCliente(): void {
    this.router.navigate(['/admin/clientes', 'nuevo']);
  }

  /**
   * Editar cliente
   */
  editarCliente(clienteId: number): void {
    this.router.navigate(['/admin/clientes', 'editar', clienteId]);
  }

  /**
   * Eliminar cliente
   */
  eliminarCliente(clienteId: number, nombreCliente: string): void {
    const confirmar = confirm(
      `¿Está seguro de eliminar al cliente "${nombreCliente}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.clienteService.eliminarCliente(clienteId).subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            alert('✓ Cliente eliminado correctamente');
          }
        },
        error: (error: unknown) => {
          console.error('Error al eliminar cliente:', error);
          alert('❌ Error al eliminar el cliente');
        },
      });
    }
  }

  /**
   * Exportar a Excel
   */
  exportarExcel(): void {
    this.clienteService.exportarExcel(this.filtrosActuales).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Clientes-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: unknown) => {
        console.error('Error al exportar:', error);
        alert('❌ Error al exportar a Excel');
      },
    });
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    const filtros = {
      ...this.filtrosActuales,
      pagina,
    };
    this.filtrosActuales = filtros;
    this.clienteService.obtenerClientes(filtros).subscribe();
  }

  /**
   * Refrescar
   */
  refrescar(): void {
    this.cargarDatos();
  }

  /**
   * Toggle filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Toggle estadísticas
   */
  toggleEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  /**
   * Obtener clase CSS según estado de venta
   */
  getEstadoClase(estado: string): string {
    const clases: Record<string, string> = {
      'Pendiente': 'estado-pendiente',
      'Confirmado': 'estado-confirmado',
      'Completado': 'estado-completado',
      'Cancelado': 'estado-cancelado',
    };
    return clases[estado] || '';
  }

  /**
 * Calcular ticket promedio del cliente
 */
calcularTicketPromedio(): number {
  if (!this.clienteSeleccionado) return 0;
  
  const total = this.clienteSeleccionado.total_compras || 0;
  const cantidad = this.clienteSeleccionado.cantidad_compras || 0;
  
  return cantidad > 0 ? total / cantidad : 0;
}

/**
 * Formatear fecha completa (dd MMM yyyy - HH:mm)
 */
formatearFechaCompleta(fecha: string): string {
  const date = new Date(fecha);
  const opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('es-PE', opciones);
}

/**
 * Formatear fecha corta (dd/MM/yyyy)
 */
formatearFechaCorta(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Obtener texto del estado
 */
getEstadoTexto(estado: string): string {
  const textos: Record<string, string> = {
    'Pendiente': '⏳ Pendiente',
    'Confirmado': '✅ Confirmado',
    'Completado': '✓ Completado',
    'Cancelado': '✕ Cancelado',
  };
  return textos[estado] || estado;
}

/**
 * Obtener ícono del método de pago
 */
getMetodoPagoIcono(metodo: string): string {
  const iconos: Record<string, string> = {
    'Efectivo': '💵',
    'Yape': '📱',
    'Plin': '💳',
    'Transferencia': '🏦',
    'Tarjeta': '💳',
  };
  return iconos[metodo] || '💰';
}

/**
 * Exportar historial a PDF (placeholder)
 */
exportarHistorial(): void {
  if (!this.clienteSeleccionado) return;
  
  alert(`📄 Exportando historial de ${this.clienteSeleccionado.nombre_cliente}...\n\n(Funcionalidad en desarrollo)`);
  
  // TODO: Implementar exportación real con jsPDF
}
}