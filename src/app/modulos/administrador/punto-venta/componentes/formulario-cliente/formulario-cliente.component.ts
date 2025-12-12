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

  readonly cerrar = output<void>();

  readonly cargando = signal(false);
  readonly buscando = signal(false);
  readonly modoCrear = signal(false);
  readonly resultadosBusqueda = signal<Cliente[]>([]);
  readonly tipoBusqueda = signal<'nombre' | 'dni' | 'telefono' | null>(null);

  readonly formBusqueda = this.fb.group({
    termino: ['', Validators.required],
  });

  readonly formCrear = this.fb.group({
    nombre: ['', Validators.required],
    dni: ['', [Validators.pattern(/^\d{8}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    email: ['', Validators.email],
    direccion: [''],
  });

  /**
   * Detectar tipo de búsqueda
   */
  detectarTipoBusqueda(valor: string): 'nombre' | 'dni' | 'telefono' | null {
    if (!valor) return null;

    if (/^9\d{8}$/.test(valor)) {
      return 'telefono';
    }

    if (/^\d{8}$/.test(valor)) {
      return 'dni';
    }

    if (/[a-zA-Z]/.test(valor)) {
      return 'nombre';
    }

    return null;
  }

  /**
   * ⭐ BUSCAR CLIENTE
   */
  buscarCliente(): void {
    if (this.formBusqueda.invalid) return;

    const termino = this.formBusqueda.value.termino!.trim();
    const tipo = this.detectarTipoBusqueda(termino);

    console.log('🔍 === BÚSQUEDA INICIADA ===');
    console.log('Término:', termino);
    console.log('Tipo:', tipo);

    if (!tipo) {
      alert('Ingrese un nombre, DNI (8 dígitos) o teléfono (9 dígitos comenzando con 9)');
      return;
    }

    this.tipoBusqueda.set(tipo);
    this.buscando.set(true);
    this.resultadosBusqueda.set([]);

    this.posService.buscarCliente(termino).subscribe({
      next: (respuesta) => {
        console.log('✅ Respuesta recibida:', respuesta);
        console.log('✅ Success:', respuesta.success);
        console.log('✅ Data:', respuesta.data);
        
        if (respuesta.data && respuesta.data.length > 0) {
          console.log('✅ Primer cliente:', respuesta.data[0]);
        }

        this.buscando.set(false);

        if (respuesta.success && respuesta.data && respuesta.data.length > 0) {
          console.log(`✅ ${respuesta.data.length} cliente(s) encontrado(s)`);
          
          if (respuesta.data.length === 1) {
            console.log('✅ Seleccionando automáticamente');
            this.seleccionarCliente(respuesta.data[0]);
          } else {
            console.log('✅ Mostrando lista');
            this.resultadosBusqueda.set(respuesta.data);
          }
        } else {
          console.log('ℹ️ No se encontraron clientes');
          this.mostrarFormularioCrear(termino, tipo);
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        
        this.buscando.set(false);
        
        if (error.status === 404) {
          console.log('📝 Mostrando formulario de creación');
          this.mostrarFormularioCrear(termino, tipo);
        } else {
          alert('Error al buscar: ' + (error.error?.message || error.message));
        }
      },
    });
  }

  /**
   * Seleccionar cliente
   */
  seleccionarCliente(cliente: Cliente): void {
    console.log('✅ SELECCIONANDO:', cliente);
    this.posService.seleccionarCliente(cliente);
    setTimeout(() => this.cerrar.emit(), 300);
  }

  /**
   * Mostrar formulario de creación
   */
  mostrarFormularioCrear(termino: string, tipo: 'nombre' | 'dni' | 'telefono'): void {
    console.log('📝 Formulario de creación');
    console.log('Término:', termino);
    console.log('Tipo:', tipo);

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
   * Crear cliente
   */
  crearCliente(): void {
    if (this.formCrear.invalid) {
      console.log('❌ Formulario inválido');
      alert('Complete todos los campos requeridos');
      return;
    }

    console.log('📝 Creando cliente:', this.formCrear.value);
    this.cargando.set(true);

    this.posService.crearCliente(this.formCrear.value).subscribe({
      next: (respuesta) => {
        console.log('✅ Cliente creado:', respuesta);
        
        if (respuesta.success && respuesta.data) {
          this.posService.seleccionarCliente(respuesta.data);
          this.cerrar.emit();
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al crear:', error);
        alert('Error: ' + (error.error?.message || error.message));
        this.cargando.set(false);
      },
    });
  }

  /**
   * Cancelar
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
   * Placeholder
   */
  get placeholderBusqueda(): string {
    return 'Nombre, DNI (8 dígitos) o Teléfono (9 dígitos)';
  }

  /**
   * Hint
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