import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../servicios/cliente.service';
import { Cliente, HistorialComprasCliente } from '../../modelos/cliente.model';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.css'],
})
export class DetalleClienteComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly cliente = signal<Cliente | null>(null);
  readonly historial = signal<HistorialComprasCliente[]>([]);
  readonly cargando = signal<boolean>(true);
  readonly cargandoHistorial = signal<boolean>(false);

  ngOnInit(): void {
    const clienteId = this.route.snapshot.params['id'];
    if (clienteId) {
      this.cargarCliente(Number(clienteId));
      this.cargarHistorial(Number(clienteId));
    }
  }

  /**
   * Cargar datos del cliente
   */
  cargarCliente(clienteId: number): void {
    this.cargando.set(true);
    this.clienteService.obtenerCliente(clienteId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.cliente.set(respuesta.data);
        }
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar cliente:', error);
        this.cargando.set(false);
      },
    });
  }

  /**
   * Cargar historial de compras
   */
  cargarHistorial(clienteId: number): void {
    this.cargandoHistorial.set(true);
    this.clienteService.obtenerHistorialCompras(clienteId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.historial.set(respuesta.data);
        }
        this.cargandoHistorial.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar historial:', error);
        this.cargandoHistorial.set(false);
      },
    });
  }

  /**
   * Editar cliente
   */
  editarCliente(): void {
    if (this.cliente()) {
      this.router.navigate(['/admin/clientes', 'editar', this.cliente()!.cliente_id]);
    }
  }

  /**
   * Eliminar cliente
   */
  eliminarCliente(): void {
    if (!this.cliente()) return;

    const confirmar = confirm(
      `¿Está seguro de eliminar al cliente "${this.cliente()!.nombre_cliente}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.clienteService.eliminarCliente(this.cliente()!.cliente_id).subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            alert('✓ Cliente eliminado correctamente');
            this.volver();
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
   * Volver a la lista
   */
  volver(): void {
    this.router.navigate(['/admin/clientes']);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha?: string | null): string {
    if (!fecha) return '—';
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