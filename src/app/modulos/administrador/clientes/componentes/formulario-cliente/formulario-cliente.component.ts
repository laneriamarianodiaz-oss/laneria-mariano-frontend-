import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../servicios/cliente.service';
import { CrearClienteDTO, ActualizarClienteDTO } from '../../modelos/cliente.model';

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.css'],
})
export class FormularioClienteComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signals
  readonly modoEdicion = signal<boolean>(false);
  readonly clienteId = signal<number | null>(null);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);

  // Formulario
  readonly nombre = signal<string>('');
  readonly telefono = signal<string>('');
  readonly email = signal<string>('');
  readonly direccion = signal<string>('');
  readonly contacto = signal<string>('');
  readonly preferencias = signal<string>('');

  // Validación
  readonly errores = signal<Record<string, string>>({});

  ngOnInit(): void {
    const clienteIdParam = this.route.snapshot.params['id'];

    if (clienteIdParam && clienteIdParam !== 'nuevo') {
      this.modoEdicion.set(true);
      this.clienteId.set(Number(clienteIdParam));
      this.cargarCliente(Number(clienteIdParam));
    }
  }

  /**
   * Cargar datos del cliente
   */
  cargarCliente(clienteId: number): void {
    this.cargando.set(true);
    this.clienteService.obtenerCliente(clienteId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          const cliente = respuesta.data;
          this.nombre.set(cliente.nombre_cliente);
          this.telefono.set(cliente.telefono);
          this.email.set(cliente.email || '');
          this.direccion.set(cliente.direccion || '');
          this.contacto.set(cliente.contacto_cliente || '');
          this.preferencias.set(cliente.preferencias_cliente || '');
        }
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar cliente:', error);
        alert('❌ Error al cargar los datos del cliente');
        this.cargando.set(false);
        this.volver();
      },
    });
  }

  /**
   * Validar formulario
   */
  validarFormulario(): boolean {
    const erroresTemp: Record<string, string> = {};

    // Nombre obligatorio
    if (!this.nombre().trim()) {
      erroresTemp['nombre'] = 'El nombre es obligatorio';
    }

    // Teléfono obligatorio y formato
    if (!this.telefono().trim()) {
      erroresTemp['telefono'] = 'El teléfono es obligatorio';
    } else if (!/^\d{9}$/.test(this.telefono().trim())) {
      erroresTemp['telefono'] = 'El teléfono debe tener 9 dígitos';
    }

    // Email opcional pero con formato válido
    if (this.email().trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())) {
      erroresTemp['email'] = 'El email no tiene un formato válido';
    }

    this.errores.set(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  }

  /**
   * Guardar cliente
   */
  guardar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {
      this.actualizarCliente();
    } else {
      this.crearCliente();
    }
  }

  /**
   * Crear nuevo cliente
   */
  crearCliente(): void {
    const datos: CrearClienteDTO = {
      nombre_cliente: this.nombre().trim(),
      telefono: this.telefono().trim(),
      email: this.email().trim() || undefined,
      direccion: this.direccion().trim() || undefined,
      contacto_cliente: this.contacto().trim() || undefined,
      preferencias_cliente: this.preferencias().trim() || undefined,
    };

    this.clienteService.crearCliente(datos).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          alert('✓ Cliente creado correctamente');
          this.router.navigate(['/admin/clientes']);
        }
        this.guardando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al crear cliente:', error);
        alert('❌ Error al crear el cliente');
        this.guardando.set(false);
      },
    });
  }

  /**
   * Actualizar cliente existente
   */
  actualizarCliente(): void {
    if (!this.clienteId()) return;

    const datos: ActualizarClienteDTO = {
      nombre_cliente: this.nombre().trim(),
      telefono: this.telefono().trim(),
      email: this.email().trim() || undefined,
      direccion: this.direccion().trim() || undefined,
      contacto_cliente: this.contacto().trim() || undefined,
      preferencias_cliente: this.preferencias().trim() || undefined,
    };

    this.clienteService.actualizarCliente(this.clienteId()!, datos).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          alert('✓ Cliente actualizado correctamente');
          this.router.navigate(['/admin/clientes']);
        }
        this.guardando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al actualizar cliente:', error);
        alert('❌ Error al actualizar el cliente');
        this.guardando.set(false);
      },
    });
  }

  /**
   * Volver a la lista
   */
  volver(): void {
    this.router.navigate(['/admin/clientes']);
  }

  /**
   * Limpiar formulario
   */
  limpiar(): void {
    const confirmar = confirm(
      '¿Está seguro de limpiar todos los campos del formulario?'
    );

    if (confirmar) {
      this.nombre.set('');
      this.telefono.set('');
      this.email.set('');
      this.direccion.set('');
      this.contacto.set('');
      this.preferencias.set('');
      this.errores.set({});
    }
  }
}