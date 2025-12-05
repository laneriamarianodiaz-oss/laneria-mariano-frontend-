import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../servicios/reporte.service';
import { FiltrosReporte, ItemVenta } from '../../modelos/reporte.model'; // ✅ Importar ItemVenta

@Component({
  selector: 'app-grafico-metodos-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grafico-metodos-pago.component.html',
  styleUrl: './grafico-metodos-pago.component.css',
})
export class GraficoMetodosPagoComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);

  // Signals del servicio
  readonly ventasPorMetodoPago = this.reporteService.ventasPorMetodoPago;
  readonly ventasPorCanal = this.reporteService.ventasPorCanal;

  // Signals locales
  cargando = signal<boolean>(false);
  vistaActiva = signal<'metodos' | 'canales'>('metodos');
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  mostrarDetalle = signal<boolean>(false);

  // ✅ Colores para los gráficos
  private readonly coloresMetodos: string[] = [
    '#8b5cf6', // Morado (principal)
    '#10b981', // Verde
    '#3b82f6', // Azul
    '#f59e0b', // Naranja
    '#ef4444', // Rojo
  ];

  private readonly coloresCanales: string[] = [
    '#8b5cf6', // Morado (principal)
    '#10b981', // Verde
    '#3b82f6', // Azul
    '#f59e0b', // Naranja
    '#ef4444', // Rojo
  ];

  ngOnInit(): void {
    this.configurarFechasPorDefecto();
    this.cargarDatos();
  }

  configurarFechasPorDefecto(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    this.fechaInicio.set(hace30Dias.toISOString().split('T')[0]);
    this.fechaFin.set(hoy.toISOString().split('T')[0]);
  }

  cargarDatos(): void {
    this.cargando.set(true);

    const filtros: FiltrosReporte = {
      fecha_inicio: this.fechaInicio(),
      fecha_fin: this.fechaFin(),
    };

    // Cargar ambos tipos de datos
    this.reporteService.obtenerVentasPorMetodoPago(filtros).subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar métodos de pago:', error);
        this.cargando.set(false);
      },
    });

    this.reporteService.obtenerVentasPorCanal(filtros).subscribe({
      error: (error) => {
        console.error('❌ Error al cargar canales de venta:', error);
      },
    });
  }

  cambiarVista(vista: 'metodos' | 'canales'): void {
    this.vistaActiva.set(vista);
  }

  aplicarFiltro(): void {
    if (this.fechaInicio() && this.fechaFin()) {
      this.cargarDatos();
    }
  }

  toggleDetalle(): void {
    this.mostrarDetalle.update((valor) => !valor);
  }

  formatearMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  // ✅ MÉTODO ACTUALIZADO: Retorna ItemVenta[]
  obtenerDatosVista(): ItemVenta[] {
    if (this.vistaActiva() === 'metodos') {
      return this.ventasPorMetodoPago() || [];
    } else {
      return this.ventasPorCanal() || [];
    }
  }

  obtenerColor(index: number): string {
    if (this.vistaActiva() === 'metodos') {
      return this.coloresMetodos[index % this.coloresMetodos.length];
    } else {
      return this.coloresCanales[index % this.coloresCanales.length];
    }
  }

  obtenerTotalVentas(): number {
    const datos = this.obtenerDatosVista();
    return datos.reduce((total, item) => total + item.total_ventas, 0);
  }

  obtenerTotalCantidad(): number {
    const datos = this.obtenerDatosVista();
    return datos.reduce((total, item) => total + item.cantidad_ventas, 0);
  }

  // ✅ MÉTODO ACTUALIZADO: Acepta ItemVenta
  obtenerIcono(item: ItemVenta): string {
    if (this.vistaActiva() === 'metodos') {
      switch (item.metodo_pago?.toLowerCase()) {
        case 'efectivo':
          return '💵';
        case 'yape':
          return '📱';
        case 'plin':
          return '💳';
        case 'transferencia':
          return '🏦';
        default:
          return '💰';
      }
    } else {
      switch (item.canal?.toLowerCase()) {
        case 'tienda fisica':
        case 'tienda':
          return '🏪';
        case 'online':
        case 'web':
          return '🌐';
        case 'whatsapp':
          return '💬';
        case 'redes sociales':
        case 'instagram':
        case 'facebook':
          return '📱';
        case 'telefono':
          return '📞';
        default:
          return '📊';
      }
    }
  }

  // ✅ MÉTODO ACTUALIZADO: Acepta ItemVenta
  obtenerNombre(item: ItemVenta): string {
    return (item.metodo_pago || item.canal || 'N/A').toUpperCase();
  }

  // ✅ MÉTODO PARA CALCULAR EL ÁNGULO DEL GRÁFICO CIRCULAR
  calcularAngulo(index: number): string {
    const datos = this.obtenerDatosVista();
    let anguloAcumulado = 0;

    for (let i = 0; i < index; i++) {
      anguloAcumulado += datos[i].porcentaje;
    }

    const anguloInicial = (anguloAcumulado * 360) / 100;
    const anguloFinal = ((anguloAcumulado + datos[index].porcentaje) * 360) / 100;

    const color = this.obtenerColor(index);

    return `conic-gradient(
      ${color} ${anguloInicial}deg,
      ${color} ${anguloFinal}deg,
      transparent ${anguloFinal}deg
    )`;
  }
}