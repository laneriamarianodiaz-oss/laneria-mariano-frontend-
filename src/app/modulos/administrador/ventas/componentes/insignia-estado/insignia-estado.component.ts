import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoVenta } from '../../modelos/venta.model';

@Component({
  selector: 'app-insignia-estado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'badge badge-' + obtenerClaseEstado()">
      {{ obtenerIconoEstado() }} {{ estado }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-pendiente {
      background: #FEF3C7;
      color: #92400E;
    }

    .badge-completada {
      background: #D1FAE5;
      color: #065F46;
    }

    .badge-cancelada {
      background: #FEE2E2;
      color: #991B1B;
    }
  `],
})
export class InsigniaEstadoComponent {
  @Input() estado!: EstadoVenta;

  obtenerClaseEstado(): string {
    const clases: Record<EstadoVenta, string> = {
      Pendiente: 'pendiente',
      Completada: 'completada',
      Cancelada: 'cancelada',
    };
    return clases[this.estado] || 'pendiente';
  }

  obtenerIconoEstado(): string {
    const iconos: Record<EstadoVenta, string> = {
      Pendiente: '⏳',
      Completada: '✅',
      Cancelada: '❌',
    };
    return iconos[this.estado] || '⏳';
  }
}