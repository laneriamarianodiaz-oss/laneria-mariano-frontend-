import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface VentaDiaria {
  fecha: string;
  total: number;
}

@Component({
  selector: 'app-grafico-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-ventas.component.html',
  styleUrl: './grafico-ventas.component.css'
})
export class GraficoVentasComponent {
  @Input() ventas: VentaDiaria[] = [];

  get maxVenta(): number {
    return Math.max(...this.ventas.map(v => v.total), 0);
  }

  calcularAltura(total: number): number {
    return (total / this.maxVenta) * 100;
  }
}