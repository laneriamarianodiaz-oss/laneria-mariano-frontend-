import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedorService } from '../../servicios/proveedor.service';
import { FiltrosProveedor } from '../../modelos/proveedor.model';

@Component({
  selector: 'app-lista-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-proveedores.component.html',
  styleUrls: ['./lista-proveedores.component.css'],
})
export class ListaProveedoresComponent implements OnInit {
  private readonly proveedorService = inject(ProveedorService);
  private readonly router = inject(Router);

  // Signals del servicio
  readonly proveedores = this.proveedorService.proveedores;
  readonly estadisticas = this.proveedorService.estadisticas;
  readonly cargando = this.proveedorService.cargando;
  readonly totalRegistros = this.proveedorService.totalRegistros;
  readonly paginaActual = this.proveedorService.paginaActual;
  readonly totalPaginas = this.proveedorService.totalPaginas;

  // Signals locales
  readonly mostrarFiltros = signal<boolean>(false);
  readonly mostrarEstadisticas = signal<boolean>(true);
  readonly filtrosActuales = signal<FiltrosProveedor>({});

  // Campos de filtros
  readonly busqueda = signal<string>('');
  readonly fechaDesde = signal<string>('');
  readonly fechaHasta = signal<string>('');

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar datos iniciales
   */
  cargarDatos(): void {
    this.proveedorService.obtenerProveedores().subscribe();
    this.proveedorService.obtenerEstadisticas().subscribe();
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    const filtros: FiltrosProveedor = {
      busqueda: this.busqueda().trim() || undefined,
      fecha_desde: this.fechaDesde() || undefined,
      fecha_hasta: this.fechaHasta() || undefined,
      pagina: 1,
      por_pagina: 10,
    };

    this.filtrosActuales.set(filtros);
    this.proveedorService.obtenerProveedores(filtros).subscribe();
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.busqueda.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.filtrosActuales.set({});
    this.proveedorService.obtenerProveedores().subscribe();
  }

  /**
   * Ver detalle de proveedor
   */
  verDetalle(proveedorId: number): void {
    this.router.navigate(['/admin/proveedores', proveedorId]);
  }

  /**
   * Crear nuevo proveedor
   */
  crearProveedor(): void {
    this.router.navigate(['/admin/proveedores', 'nuevo']);
  }

  /**
   * Editar proveedor
   */
  editarProveedor(proveedorId: number): void {
    this.router.navigate(['/admin/proveedores', 'editar', proveedorId]);
  }

  /**
   * Eliminar proveedor
   */
  eliminarProveedor(proveedorId: number, nombreProveedor: string): void {
    const confirmar = confirm(
      `¿Está seguro de eliminar al proveedor "${nombreProveedor}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.proveedorService.eliminarProveedor(proveedorId).subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            alert('✓ Proveedor eliminado correctamente');
            this.refrescar();
          }
        },
        error: (error: unknown) => {
          console.error('Error al eliminar proveedor:', error);
          alert('❌ Error al eliminar el proveedor');
        },
      });
    }
  }

  /**
   * Exportar a Excel
   */
  exportarExcel(): void {
    this.proveedorService.exportarExcel(this.filtrosActuales()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Proveedores-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: unknown) => {
        console.error('Error al exportar:', error);
        alert('❌ Error al exportar los datos');
      },
    });
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    const filtros = {
      ...this.filtrosActuales(),
      pagina,
      por_pagina: 10,
    };
    this.proveedorService.obtenerProveedores(filtros).subscribe();
  }

  /**
   * Refrescar datos
   */
  refrescar(): void {
    this.proveedorService.refrescar(this.filtrosActuales());
  }

  /**
   * Toggle mostrar filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros.update((value) => !value);
  }

  /**
   * Toggle mostrar estadísticas
   */
  toggleEstadisticas(): void {
    this.mostrarEstadisticas.update((value) => !value);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}