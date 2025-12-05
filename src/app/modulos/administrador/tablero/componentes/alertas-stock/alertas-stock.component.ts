import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ProductoStock {
  id: number;
  nombre: string;
  codigo: string;
  stock: number;
  stockMinimo: number;
  estado: 'critico' | 'bajo' | 'normal';
}

@Component({
  selector: 'app-alertas-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-stock.component.html',
  styleUrl: './alertas-stock.component.css'
})
export class AlertasStockComponent {
  @Input() productos: ProductoStock[] = [];

  constructor(private router: Router) {}

  verInventario(): void {
    this.router.navigate(['/admin/inventario']);
  }
}