import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PosService } from '../../servicios/pos.service';
import { Cliente } from '../../modelos/pos.model';

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.css'],
})
export class FormularioClienteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly posService = inject(PosService);

  // Output
  readonly cerrar = output<void>();

  // Estados
  readonly cargando = signal(false);
  readonly buscando = signal(false);
  readonly modoCrear = signal(false);
  readonly resultadosBusqueda = signal<Cliente[]>([]);
  readonly tipoBusqueda = signal<'nombre' | 'dni' | 'telefono' | null>(null);

  // Formulario de búsqueda universal
  readonly formBusqueda = this.fb.group({
    termino: ['', Validators.required],
  });

  // Formulario de creación
  readonly formCrear = this.fb.group({
    nombre: ['', Validators.required],
    dni: ['', [Validators.pattern(/^\d{8}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    email: ['', Validators.email],
    direccion: [''],
  });

  /**
   * ⭐ Detectar tipo de búsqueda automáticamente
   */
  detectarTipoBusqueda(valor: string): 'nombre' | 'dni' | 'telefono' | null {
    if (!valor) return null;

    // Si empieza con 9 y tiene 9 dígitos → teléfono
    if (/^9\d{8}$/.test(valor)) {
      return 'telefono';
    }

    // Si tiene 8 dígitos → DNI
    if (/^\d{8}$/.test(valor)) {
      return 'dni';
    }

    // Si contiene letras → nombre
    if (/[a-zA-Z]/.test(valor)) {
      return 'nombre';
    }

    return null;
  }

  /**
   * ⭐ Buscar cliente (universal)
   */
  buscarCliente(): void {
    if (this.formBusqueda.invalid) return;

    const termino = this.formBusqueda.value.termino!.trim();
    const tipo = this.detectarTipoBusqueda(termino);

    if (!tipo) {
      alert('Ingrese un nombre, DNI (8 dígitos) o teléfono (9 dígitos comenzando con 9)');
      return;
    }

    this.tipoBusqueda.set(tipo);
    this.buscando.set(true);
    this.resultadosBusqueda.set([]);

    this.posService.buscarCliente(termino).subscribe({
      next: (respuesta) => {
        this.buscando.set(false);

        if (respuesta.success && respuesta.data && respuesta.data.length > 0) {
          // Si encontró exactamente 1 cliente, seleccionarlo automáticamente
          if (respuesta.data.length === 1) {
            this.seleccionarCliente(respuesta.data[0]);
          } else {
            // Si encontró múltiples, mostrar lista
            this.resultadosBusqueda.set(respuesta.data);
          }
        } else {
          // No encontró, mostrar formulario de creación
          this.mostrarFormularioCrear(termino, tipo);
        }
      },
      error: (error) => {
        console.error('Error al buscar cliente:', error);
        this.buscando.set(false);
        this.mostrarFormularioCrear(termino, tipo);
      },
    });
  }

  /**
   * Seleccionar cliente de la lista
   */
  seleccionarCliente(cliente: Cliente): void {
    this.posService.seleccionarCliente(cliente);
    setTimeout(() => this.cerrar.emit(), 300);
  }

  /**
   * Mostrar formulario de creación
   */
  mostrarFormularioCrear(termino: string, tipo: 'nombre' | 'dni' | 'telefono'): void {
    // Pre-llenar el campo según lo que buscó
    if (tipo === 'telefono') {
      this.formCrear.patchValue({ telefono: termino });
    } else if (tipo === 'dni') {
      this.formCrear.patchValue({ dni: termino });
    } else if (tipo === 'nombre') {
      this.formCrear.patchValue({ nombre: termino });
    }

    this.modoCrear.set(true);
  }

  /**
   * Crear nuevo cliente
   */
  crearCliente(): void {
    if (this.formCrear.invalid) {
      alert('Por favor complete todos los campos requeridos correctamente');
      return;
    }

    this.cargando.set(true);

    this.posService.crearCliente(this.formCrear.value).subscribe({
      next: (respuesta) => {
        if (respuesta.success && respuesta.data) {
          this.posService.seleccionarCliente(respuesta.data);
          this.cerrar.emit();
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        alert('Error al crear el cliente: ' + (error.error?.message || error.message));
        this.cargando.set(false);
      },
    });
  }

  /**
   * Cancelar y cerrar
   */
  cancelar(): void {
    this.cerrar.emit();
  }

  /**
   * Volver a búsqueda
   */
  volverBusqueda(): void {
    this.modoCrear.set(false);
    this.resultadosBusqueda.set([]);
    this.formCrear.reset();
  }

  /**
   * Obtener placeholder dinámico
   */
  get placeholderBusqueda(): string {
    return 'Nombre, DNI (8 dígitos) o Teléfono (9 dígitos)';
  }

  /**
   * Obtener hint de búsqueda
   */
  get hintBusqueda(): string {
    const termino = this.formBusqueda.value.termino || '';
    const tipo = this.detectarTipoBusqueda(termino);

    if (!termino) {
      return 'Ejemplos: Juan Pérez, 12345678, 987654321';
    }

    switch (tipo) {
      case 'telefono':
        return '📱 Buscando por teléfono';
      case 'dni':
        return '🪪 Buscando por DNI';
      case 'nombre':
        return '👤 Buscando por nombre';
      default:
        return '❌ Formato inválido';
    }
  }
}