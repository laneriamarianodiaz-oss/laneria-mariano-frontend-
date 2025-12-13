import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface VentaReciente {
  id: number;
  numero: string;
  fecha: string;
  cliente: string;
  total: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
}

@Component({
  selector: 'app-ventas-recientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas-recientes.component.html',
  styleUrl: './ventas-recientes.component.css'
})
export class VentasRecientesComponent {
  @Input() ventas: VentaReciente[] = [];

  constructor(private router: Router) {}

  verTodasVentas(): void {
    this.router.navigate(['/admin/ventas']);
  }
}