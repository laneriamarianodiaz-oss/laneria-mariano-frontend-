import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { CarritoService } from '../../../carrito/servicios/carrito.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.scss'
})
export class InicioSesionComponent {
  formularioLogin: FormGroup;
  cargando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private router: Router,
    private carritoService: CarritoService 
  ) {
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  cerrar(): void {
    this.router.navigate(['/catalogo']);
  }

  iniciarSesion(): void {
    if (this.formularioLogin.valid) {
      this.cargando = true;
      this.error = null;
      
      const { email, password } = this.formularioLogin.value;

      this.authService.iniciarSesion(email, password).subscribe({
        next: (respuesta) => {
          console.log('Respuesta login:', respuesta);
          
          // ← NUEVO: Detectar si requiere verificación
          if (respuesta.requires_verification) {
            console.log('Email no verificado, redirigiendo a verificación');
            this.router.navigate(['/autenticacion/verificar-email']);
            this.cargando = false;
            return;
          }

          // Login exitoso
          console.log('Login exitoso', respuesta);
          
          const usuario = this.authService.obtenerUsuario();
          this.carritoService.cargarCarritoBackend();

          if (usuario && (usuario.rol === 'administrador' || usuario.rol === 'vendedor')) {
            this.router.navigate(['/admin/tablero']);
          } else {
            this.router.navigate(['/catalogo']);
          }
          
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al iniciar sesión', error);
          
          if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Credenciales incorrectas';
          }
          
          this.cargando = false;
        }
      });
    }
  }
}