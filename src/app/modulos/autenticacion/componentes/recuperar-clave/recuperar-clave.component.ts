import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-recuperar-clave',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-clave.component.html',
  styleUrl: './recuperar-clave.component.scss'
})
export class RecuperarClaveComponent {
  formularioRecuperar: FormGroup;
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private router: Router
  ) {
    this.formularioRecuperar = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  recuperar(): void {
    if (this.formularioRecuperar.valid) {
      this.cargando = true;
      this.error = null;
      this.exito = null;
      
      const email = this.formularioRecuperar.value.email;

      this.authService.olvideMiContrasena(email).subscribe({
        next: (respuesta) => {
          console.log('Email de recuperación enviado', respuesta);
          this.exito = 'Se ha enviado un enlace de recuperación a tu correo';
          this.cargando = false;
          
          setTimeout(() => {
            this.router.navigate(['/autenticacion/inicio-sesion']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error al enviar email', error);
          
          if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Error al enviar email. Intenta de nuevo.';
          }
          
          this.cargando = false;
        }
      });
    }
  }

  cerrar(): void {
    this.router.navigate(['/catalogo']);
  }
}