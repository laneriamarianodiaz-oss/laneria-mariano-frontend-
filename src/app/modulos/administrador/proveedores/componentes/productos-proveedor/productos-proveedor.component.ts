import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../servicios/proveedor.service';
import { Proveedor, ProductoProveedor } from '../../modelos/proveedor.model';

@Component({
  selector: 'app-productos-proveedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-proveedor.component.html',
  styleUrls: ['./productos-proveedor.component.scss'],
})
export class ProductosProveedorComponent implements OnInit {
  private readonly proveedorService = inject(ProveedorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly proveedor = signal<Proveedor | null>(null);
  readonly productos = signal<ProductoProveedor[]>([]);
  readonly cargando = signal<boolean>(true);
  readonly cargandoProductos = signal<boolean>(false);

  ngOnInit(): void {
    const proveedorId = this.route.snapshot.params['id'];
    if (proveedorId) {
      this.cargarProveedor(Number(proveedorId));
      this.cargarProductos(Number(proveedorId));
    }
  }

  /**
   * Cargar datos del proveedor
   */
  cargarProveedor(proveedorId: number): void {
    this.cargando.set(true);
    this.proveedorService.obtenerProveedor(proveedorId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.proveedor.set(respuesta.data);
        }
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar proveedor:', error);
        alert('❌ Error al cargar los datos del proveedor');
        this.cargando.set(false);
        this.volver();
      },
    });
  }

  /**
   * Cargar productos del proveedor
   */
  cargarProductos(proveedorId: number): void {
    this.cargandoProductos.set(true);
    this.proveedorService.obtenerProductosProveedor(proveedorId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.productos.set(respuesta.data);
        }
        this.cargandoProductos.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar productos:', error);
        this.cargandoProductos.set(false);
      },
    });
  }

  /**
   * Editar proveedor
   */
  editarProveedor(): void {
    if (this.proveedor()) {
      this.router.navigate(['/admin/proveedores', 'editar', this.proveedor()!.proveedor_id]);
    }
  }

  /**
   * Eliminar proveedor
   */
  eliminarProveedor(): void {
    if (!this.proveedor()) return;

    const confirmar = confirm(
      `¿Está seguro de eliminar al proveedor "${this.proveedor()!.nombre}"?\n\nEsta acción eliminará también su relación con los productos.\nLos productos NO se eliminarán, solo quedarán sin proveedor asignado.`
    );

    if (confirmar) {
      this.proveedorService.eliminarProveedor(this.proveedor()!.proveedor_id).subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            alert('✓ Proveedor eliminado correctamente');
            this.volver();
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
   * Volver a la lista
   */
  volver(): void {
    this.router.navigate(['/admin/proveedores']);
  }

  /**
   * Refrescar datos
   */
  refrescar(): void {
    if (this.proveedor()) {
      this.cargarProveedor(this.proveedor()!.proveedor_id);
      this.cargarProductos(this.proveedor()!.proveedor_id);
    }
  }

  /**
   * Ver producto en detalle (opcional: navegar al módulo de productos)
   */
  verProducto(productoId: number): void {
    // Opcional: navegar al detalle del producto
    this.router.navigate(['/admin/productos', productoId]);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }
}