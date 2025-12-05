import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Producto } from '../../../productos/modelos/producto.model';

interface RespuestaBusqueda {
  success: boolean;
  data: Producto[];
}

@Component({
  selector: 'app-busqueda-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda-productos.component.html',
  styleUrls: ['./busqueda-productos.component.css'],
})
export class BusquedaProductosComponent {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://laneria-mariano-backend-production.up.railway.app/api/v1';

  // Output
  readonly productoSeleccionado = output<Producto>();

  // Signals
  readonly terminoBusqueda = signal('');
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);
  readonly mostrarResultados = signal(false);

  // Subject para búsqueda con debounce
  private readonly busquedaSubject = new Subject<string>();

  constructor() {
    // Configurar búsqueda con debounce
    this.busquedaSubject
      .pipe(
        debounceTime(300),
        switchMap((termino) => this.buscarProductos(termino))
      )
      .subscribe({
        next: (respuesta) => {
          this.productos.set(respuesta.data || []);
          this.cargando.set(false);
          this.mostrarResultados.set(true);
        },
        error: () => {
          this.cargando.set(false);
          this.productos.set([]);
        },
      });
  }

  /**
   * Manejar cambio en el input
   */
  onBuscar(event: Event): void {
    const termino = (event.target as HTMLInputElement).value;
    this.terminoBusqueda.set(termino);

    if (termino.length >= 2) {
      this.cargando.set(true);
      this.busquedaSubject.next(termino);
    } else {
      this.productos.set([]);
      this.mostrarResultados.set(false);
    }
  }

  /**
   * Seleccionar producto
   */
  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado.emit(producto);
    this.terminoBusqueda.set('');
    this.productos.set([]);
    this.mostrarResultados.set(false);
  }

  /**
   * Buscar productos en el backend
   */
  private buscarProductos(termino: string) {
    return this.http.get<RespuestaBusqueda>(
      `${this.API_URL}/productos?search=${termino}`
    );
  }

  /**
   * Cerrar resultados al perder foco
   */
  cerrarResultados(): void {
    setTimeout(() => {
      this.mostrarResultados.set(false);
    }, 200);
  }
}