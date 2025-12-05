import { Component, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../nucleo/constantes/endpoints-api';

interface MenuItem {
  iconUrl: string;   // ← ahora será una imagen
  label: string;
  route: string;
  badge?: number;
}


@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-lateral.component.html',
  styleUrl: './menu-lateral.component.css'
})
export class MenuLateralComponent {
  
  // ✅ Usar HttpClient directamente
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  @Output() sidebarToggled = new EventEmitter<boolean>();
  
  isCollapsed = signal(false);
  stockBajoCount = signal(0);
  
  menuItems = computed<MenuItem[]>(() => [
  {
    iconUrl: 'panel/tablero.png',
    label: 'Tablero',
    route: '/admin/tablero'
  },
  {
    iconUrl: 'panel/producto.png',
    label: 'Productos',
    route: '/admin/productos'
  },
  {
    iconUrl: 'panel/inventario.png',
    label: 'Inventario',
    route: '/admin/inventario',
    badge: this.stockBajoCount()
  },
  {
    iconUrl: 'panel/pos.png',
    label: 'Punto de Venta',
    route: '/admin/punto-venta'
  },
  {
    iconUrl: 'panel/ventas.png',
    label: 'Ventas',
    route: '/admin/ventas'
  },
  {
    iconUrl: 'panel/clientes.png',
    label: 'Clientes',
    route: '/admin/clientes'
  },
  {
    iconUrl: 'panel/proveedores.png',
    label: 'Proveedores',
    route: '/admin/proveedores'
  },
  {
    iconUrl: 'panel/reportes.png',
    label: 'Reportes',
    route: '/admin/reportes'
  },
  {
    iconUrl: 'panel/reportes.png',
    label: 'Configuración',
    route: '/admin/configuracion'
  }
]);

  constructor() {
    this.cargarAlertasStock();
  }

  private cargarAlertasStock(): void {
    const url = `${this.apiUrl}${API_ENDPOINTS.INVENTARIO.ALERTAS_STOCK_BAJO}`;
    
    this.http.get<any[]>(url).subscribe({
      next: (productos) => {
        this.stockBajoCount.set(productos.length);
      },
      error: (error) => {
        console.error('Error al cargar alertas de stock:', error);
        // Valor de prueba mientras no haya backend
        this.stockBajoCount.set(8);
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
    this.sidebarToggled.emit(this.isCollapsed());
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}