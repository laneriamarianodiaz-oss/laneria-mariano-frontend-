import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarjetasEstadisticasComponent } from '../tarjetas-estadisticas/tarjetas-estadisticas.component';
import { GraficoVentasComponent } from '../grafico-ventas/grafico-ventas.component';
import { AlertasStockComponent } from '../alertas-stock/alertas-stock.component';
import { VentasRecientesComponent } from '../ventas-recientes/ventas-recientes.component';
import { TableroService } from '../../servicios/tablero.service';
import { DashboardData } from '../../modelos/tablero.model';

@Component({
  selector: 'app-tablero-principal',
  standalone: true,
  imports: [
    CommonModule,
    TarjetasEstadisticasComponent,
    GraficoVentasComponent,
    AlertasStockComponent,
    VentasRecientesComponent
  ],
  templateUrl: './tablero-principal.component.html',
  styleUrl: './tablero-principal.component.css'
})
export class TableroPrincipalComponent implements OnInit {
  
  private tableroService = inject(TableroService);
  
  // Signals
  cargando = signal(true);
  datos = signal<DashboardData | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar datos del dashboard
   */
  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    // ✅ USAR obtenerEstadisticas() en lugar de obtenerDatosDashboard()
    this.tableroService.obtenerEstadisticas().subscribe({
      next: (estadisticas) => {
        console.log('📊 Estadísticas recibidas:', estadisticas);
        
        // ✅ Construir DashboardData con los datos reales
        const dashboardData: DashboardData = {
          estadisticas: {
            ventasHoy: estadisticas.ventasHoy,
            ventasMes: estadisticas.ventasMes,
            ticketPromedio: estadisticas.ticketPromedio,
            productosStockBajo: estadisticas.productosStockBajo
          },
          // Datos de prueba para las secciones que aún no tienen backend
          ventasSemana: this.generarVentasSemana(),
          alertasStock: [],
          ventasRecientes: [],
          topProductos: []
        };

        this.datos.set(dashboardData);
        this.cargando.set(false);
        
        // Cargar alertas de stock
        this.cargarAlertasStock();
      },
      error: (err) => {
        console.error('❌ Error al cargar datos del dashboard:', err);
        this.error.set('Error al cargar los datos. Por favor, intente nuevamente.');
        this.cargando.set(false);
        
        // Datos de prueba mientras no hay backend
        this.cargarDatosPrueba();
      }
    });
  }

  /**
   * Cargar alertas de stock
   */
  private cargarAlertasStock(): void {
    this.tableroService.obtenerAlertasStock().subscribe({
      next: (alertas) => {
        const datosActuales = this.datos();
        if (datosActuales) {
          this.datos.set({
            ...datosActuales,
            alertasStock: alertas
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar alertas:', err);
      }
    });
  }

  /**
   * Generar datos de ventas de la semana (placeholder)
   */
  private generarVentasSemana() {
    return [
      { fecha: 'Lun', total: 0 },
      { fecha: 'Mar', total: 0 },
      { fecha: 'Mié', total: 0 },
      { fecha: 'Jue', total: 0 },
      { fecha: 'Vie', total: 0 },
      { fecha: 'Sáb', total: 0 },
      { fecha: 'Dom', total: 0 }
    ];
  }

  /**
   * Datos de prueba para desarrollo
   */
  private cargarDatosPrueba(): void {
    const datosPrueba: DashboardData = {
      estadisticas: {
        ventasHoy: 0,
        ventasMes: 25.00,
        ticketPromedio: 25.00,
        productosStockBajo: 0
      },
      ventasSemana: [
        { fecha: 'Lun', total: 0 },
        { fecha: 'Mar', total: 0 },
        { fecha: 'Mié', total: 0 },
        { fecha: 'Jue', total: 0 },
        { fecha: 'Vie', total: 0 },
        { fecha: 'Sáb', total: 25 },
        { fecha: 'Dom', total: 0 }
      ],
      alertasStock: [],
      ventasRecientes: [],
      topProductos: []
    };

    this.datos.set(datosPrueba);
    this.error.set(null);
  }

  /**
   * Recargar datos
   */
  recargar(): void {
    this.cargarDatos();
  }
}