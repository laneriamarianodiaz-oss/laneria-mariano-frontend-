import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  formularioRegistro: FormGroup;
  cargando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private router: Router
  ) {
    this.formularioRegistro = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.minLength(9)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  registrarse(): void {
    if (this.formularioRegistro.valid) {
      this.cargando = true;
      this.error = null;

      const datos = {
        name: `${this.formularioRegistro.value.nombre} ${this.formularioRegistro.value.apellido}`,
        email: this.formularioRegistro.value.email,
        password: this.formularioRegistro.value.password,
        password_confirmation: this.formularioRegistro.value.password,
        telefono: this.formularioRegistro.value.telefono
      };

      this.authService.registrarse(datos).subscribe({
        next: (respuesta) => {
          console.log('✅ Registro exitoso', respuesta);
          
          // Guardar token automáticamente
          if (respuesta.data && respuesta.data.token) {
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.user));
            
            // Redirigir según el rol
            if (respuesta.data.user.rol === 'administrador') {
              this.router.navigate(['/administrador']);
            } else {
              this.router.navigate(['/catalogo']);
            }
          }
          
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al registrarse', error);
          
          // Mostrar error específico
          if (error.error?.message) {
            this.error = error.error.message;
          } else if (error.error?.errors) {
            // Si hay errores de validación
            const errores = Object.values(error.error.errors).flat();
            this.error = errores.join(', ');
          } else {
            this.error = 'Error al registrarse. Intenta de nuevo.';
          }
          
          this.cargando = false;
        }
      });
    } else {
      this.error = 'Por favor completa todos los campos correctamente';
    }
  }

  cerrar(): void {
    this.router.navigate(['/catalogo']);
  }
}