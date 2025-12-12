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
      telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]], // ⭐ OBLIGATORIO
      direccion: [''], // ⭐ Opcional
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordsCoinciden
    });
  }

  passwordsCoinciden(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmacion = group.get('password_confirmation')?.value;
    return password === confirmacion ? null : { passwordsMismatch: true };
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
        telefono: this.formularioRegistro.value.telefono,
        dni: this.formularioRegistro.value.dni, // ⭐ Se envía siempre
        direccion: this.formularioRegistro.value.direccion || undefined
      };

      console.log('📤 Enviando datos de registro:', datos);

      this.authService.registrarse(datos).subscribe({
        next: (respuesta) => {
          console.log('✅ Registro exitoso', respuesta);
          
          if (respuesta.success && respuesta.data && respuesta.data.token) {
            setTimeout(() => {
              const rol = respuesta.data.user.rol;
              
              if (rol === 'administrador') {
                this.router.navigate(['/administrador']).then(() => {
                  window.location.reload();
                });
              } else {
                this.router.navigate(['/catalogo']).then(() => {
                  window.location.reload();
                });
              }
            }, 300);
          } else {
            this.error = 'Error al procesar el registro';
            this.cargando = false;
          }
        },
        error: (error) => {
          console.error('❌ Error al registrarse', error);
          
          if (error.error?.message) {
            this.error = error.error.message;
          } else if (error.error?.errors) {
            const errores = Object.values(error.error.errors).flat();
            this.error = (errores as string[]).join(', ');
          } else {
            this.error = 'Error al registrarse. Intenta de nuevo.';
          }
          
          this.cargando = false;
        }
      });
    } else {
      if (this.formularioRegistro.errors?.['passwordsMismatch']) {
        this.error = 'Las contraseñas no coinciden';
      } else {
        this.error = 'Por favor completa todos los campos correctamente';
      }
    }
  }

  cerrar(): void {
    this.router.navigate(['/catalogo']);
  }
}