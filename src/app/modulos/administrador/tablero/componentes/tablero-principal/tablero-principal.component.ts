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
   * Cargar todos los datos del dashboard
   */
  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    // ✅ Usar el método que carga todos los datos
    this.tableroService.obtenerDatosDashboard().subscribe({
      next: (resultado) => {
        console.log('📊 Datos del dashboard recibidos:', resultado);
        
        const dashboardData: DashboardData = {
          estadisticas: {
            ventasHoy: resultado.estadisticas.ventasHoy,
            ventasMes: resultado.estadisticas.ventasMes,
            ticketPromedio: resultado.estadisticas.ticketPromedio,
            productosStockBajo: resultado.estadisticas.productosStockBajo,
            cambioVentasHoy: resultado.estadisticas.cambioVentasHoy,
            cambioVentasMes: resultado.estadisticas.cambioVentasMes,
            cambioTicket: resultado.estadisticas.cambioTicket
          },
          ventasSemana: resultado.ventasSemana || [],
          alertasStock: resultado.alertasStock || [],
          ventasRecientes: resultado.ventasRecientes || [],
          topProductos: resultado.topProductos || []
        };

        this.datos.set(dashboardData);
        this.cargando.set(false);
        
        console.log('✅ Dashboard cargado exitosamente');
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
   * Datos de prueba para desarrollo
   */
  private cargarDatosPrueba(): void {
    const datosPrueba: DashboardData = {
      estadisticas: {
        ventasHoy: 0,
        ventasMes: 0,
        ticketPromedio: 0,
        productosStockBajo: 0,
        cambioVentasHoy: 0,
        cambioVentasMes: 0,
        cambioTicket: 0
      },
      ventasSemana: [
        { fecha: 'Lun', total: 0 },
        { fecha: 'Mar', total: 0 },
        { fecha: 'Mié', total: 0 },
        { fecha: 'Jue', total: 0 },
        { fecha: 'Vie', total: 0 },
        { fecha: 'Sáb', total: 0 },
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