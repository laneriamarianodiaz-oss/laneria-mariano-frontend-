import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { CarritoService } from '../../../carrito/servicios/carrito.service';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.scss'
})
export class VerificarEmailComponent implements OnInit {
  formularioVerificacion: FormGroup;
  cargando = false;
  enviandoCodigo = false;
  error: string | null = null;
  exito: string | null = null;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private router: Router,
    private carritoService: CarritoService
  ) {
    this.formularioVerificacion = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener el email pendiente de verificación
    this.email = this.authService.obtenerEmailPendiente() || '';
    
    if (!this.email) {
      // Si no hay email pendiente, redirigir a registro
      this.router.navigate(['/autenticacion/registro']);
    }
  }

  verificar(): void {
    if (this.formularioVerificacion.valid) {
      this.cargando = true;
      this.error = null;
      this.exito = null;

      const code = this.formularioVerificacion.value.code;

      this.authService.verificarEmail(this.email, code).subscribe({
        next: (respuesta) => {
          console.log('Email verificado exitosamente', respuesta);
          this.exito = 'Email verificado exitosamente';
          
          // Cargar carrito del backend
          this.carritoService.cargarCarritoBackend();

          // Verificar rol y redirigir
          const usuario = this.authService.obtenerUsuario();
          
          setTimeout(() => {
            if (usuario && (usuario.rol === 'administrador' || usuario.rol === 'vendedor')) {
              this.router.navigate(['/admin/tablero']);
            } else {
              this.router.navigate(['/catalogo']);
            }
          }, 1500);
          
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al verificar email', error);
          
          if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Código inválido o expirado. Intenta de nuevo.';
          }
          
          this.cargando = false;
        }
      });
    }
  }

  reenviarCodigo(): void {
    this.enviandoCodigo = true;
    this.error = null;
    this.exito = null;

    this.authService.reenviarCodigo(this.email).subscribe({
      next: (respuesta) => {
        console.log('Código reenviado', respuesta);
        this.exito = 'Código reenviado exitosamente. Revisa tu correo.';
        this.enviandoCodigo = false;
      },
      error: (error) => {
        console.error('Error al reenviar código', error);
        this.error = 'Error al reenviar código. Intenta de nuevo.';
        this.enviandoCodigo = false;
      }
    });
  }

  cerrar(): void {
    this.router.navigate(['/catalogo']);
  }
}