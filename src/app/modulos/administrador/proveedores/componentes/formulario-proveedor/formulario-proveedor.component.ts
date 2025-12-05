import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../servicios/proveedor.service';
import { CrearProveedorDTO, ActualizarProveedorDTO } from '../../modelos/proveedor.model';

@Component({
  selector: 'app-formulario-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-proveedor.component.html',
  styleUrls: ['./formulario-proveedor.component.css'],
})
export class FormularioProveedorComponent implements OnInit {
  private readonly proveedorService = inject(ProveedorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signals
  readonly modoEdicion = signal<boolean>(false);
  readonly proveedorId = signal<number | null>(null);
  readonly cargando = signal<boolean>(false);
  readonly guardando = signal<boolean>(false);

  // Formulario
  readonly nombre = signal<string>('');
  readonly contacto = signal<string>('');
  readonly telefono = signal<string>('');
  readonly email = signal<string>('');
  readonly direccion = signal<string>('');

  // Validación
  readonly errores = signal<Record<string, string>>({});

  ngOnInit(): void {
    const proveedorIdParam = this.route.snapshot.params['id'];

    if (proveedorIdParam && proveedorIdParam !== 'nuevo') {
      this.modoEdicion.set(true);
      this.proveedorId.set(Number(proveedorIdParam));
      this.cargarProveedor(Number(proveedorIdParam));
    }
  }

  /**
   * Cargar datos del proveedor
   */
  cargarProveedor(proveedorId: number): void {
    this.cargando.set(true);
    this.proveedorService.obtenerProveedor(proveedorId).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          const proveedor = respuesta.data;
          this.nombre.set(proveedor.nombre);
          this.contacto.set(proveedor.contacto || '');
          this.telefono.set(proveedor.telefono || '');
          this.email.set(proveedor.email || '');
          this.direccion.set(proveedor.direccion || '');
        }
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar proveedor:', error);
        alert('❌ Error al cargar los datos del proveedor');
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
      erroresTemp['nombre'] = 'El nombre del proveedor es obligatorio';
    }

    // Teléfono opcional pero con formato válido
    if (this.telefono().trim() && !/^\d{9}$/.test(this.telefono().trim())) {
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
   * Guardar proveedor
   */
  guardar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {
      this.actualizarProveedor();
    } else {
      this.crearProveedor();
    }
  }

  /**
   * Crear nuevo proveedor
   */
  crearProveedor(): void {
    const datos: CrearProveedorDTO = {
      nombre: this.nombre().trim(),
      contacto: this.contacto().trim() || undefined,
      telefono: this.telefono().trim() || undefined,
      email: this.email().trim() || undefined,
      direccion: this.direccion().trim() || undefined,
    };

    this.proveedorService.crearProveedor(datos).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          alert('✓ Proveedor creado correctamente');
          this.router.navigate(['/admin/proveedores']);
        }
        this.guardando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al crear proveedor:', error);
        alert('❌ Error al crear el proveedor');
        this.guardando.set(false);
      },
    });
  }

  /**
   * Actualizar proveedor existente
   */
  actualizarProveedor(): void {
    if (!this.proveedorId()) return;

    const datos: ActualizarProveedorDTO = {
      nombre: this.nombre().trim(),
      contacto: this.contacto().trim() || undefined,
      telefono: this.telefono().trim() || undefined,
      email: this.email().trim() || undefined,
      direccion: this.direccion().trim() || undefined,
    };

    this.proveedorService.actualizarProveedor(this.proveedorId()!, datos).subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          alert('✓ Proveedor actualizado correctamente');
          this.router.navigate(['/admin/proveedores']);
        }
        this.guardando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al actualizar proveedor:', error);
        alert('❌ Error al actualizar el proveedor');
        this.guardando.set(false);
      },
    });
  }

  /**
   * Volver a la lista
   */
  volver(): void {
    this.router.navigate(['/admin/proveedores']);
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
      this.contacto.set('');
      this.telefono.set('');
      this.email.set('');
      this.direccion.set('');
      this.errores.set({});
    }
  }
}