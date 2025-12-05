import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { entorno } from '../../../entornos/entorno';
import { AlmacenamientoService } from './almacenamiento.service';

export interface Usuario {
  id: number;
  nombre: string;
  name?: string; // ← AGREGAR
  email: string;
  rol: 'administrador' | 'vendedor' | 'cliente';
  email_verified?: boolean;
}

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

export interface RespuestaRegistro {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      rol: string;
      email_verified: boolean;
    };
    token?: string;
  };
}

export interface RespuestaVerificacion {
  success: boolean;
  message: string;
  data: {
    user: Usuario;
    token: string;
    token_type: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private urlApi = entorno.urlApi;
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioActual.asObservable();

  private emailPendiente = new BehaviorSubject<string | null>(null);
  public emailPendiente$ = this.emailPendiente.asObservable();

  constructor(
    private http: HttpClient,
    private almacenamiento: AlmacenamientoService,
    private router: Router
  ) {
    const usuario = this.almacenamiento.obtenerItem<Usuario>(entorno.claveUsuario);
    if (usuario) {
      this.usuarioActual.next(usuario);
    }
  }

  iniciarSesion(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/auth/login`, { email, password }).pipe(
      tap(respuesta => {
        if (respuesta.success) {
          const datos: RespuestaLogin = {
            token: respuesta.data.token,
            usuario: {
              id: respuesta.data.user.id,
              nombre: respuesta.data.user.name || respuesta.data.user.nombre || '', // ← CORREGIDO
              email: respuesta.data.user.email,
              rol: respuesta.data.user.rol,
              email_verified: respuesta.data.user.email_verified
            }
          };
          
          this.almacenamiento.guardarItem(entorno.claveToken, datos.token);
          this.almacenamiento.guardarItem(entorno.claveUsuario, datos.usuario);
          this.usuarioActual.next(datos.usuario);
        } else if (respuesta.requires_verification) {
          this.emailPendiente.next(respuesta.email);
        }
      })
    );
  }

  registrarse(datos: any): Observable<RespuestaRegistro> {
    const datosCompletos = {
      ...datos,
      password_confirmation: datos.password
    };

    return this.http.post<RespuestaRegistro>(`${this.urlApi}/auth/register`, datosCompletos).pipe(
      tap(respuesta => {
        if (respuesta.success) {
          this.emailPendiente.next(respuesta.data.user.email);
          console.log('Usuario registrado. Debe verificar email:', respuesta.data.user.email);
        }
      })
    );
  }

  verificarEmail(email: string, code: string): Observable<RespuestaVerificacion> {
    return this.http.post<RespuestaVerificacion>(`${this.urlApi}/auth/verify-email`, { 
      email, 
      code 
    }).pipe(
      tap(respuesta => {
        if (respuesta.success) {
          const datos: RespuestaLogin = {
            token: respuesta.data.token,
            usuario: {
              id: respuesta.data.user.id,
              nombre: respuesta.data.user.name || respuesta.data.user.nombre || '', // ← CORREGIDO
              email: respuesta.data.user.email,
              rol: respuesta.data.user.rol,
              email_verified: true
            }
          };
          
          this.almacenamiento.guardarItem(entorno.claveToken, datos.token);
          this.almacenamiento.guardarItem(entorno.claveUsuario, datos.usuario);
          this.almacenamiento.eliminarItem('carrito');
          this.usuarioActual.next(datos.usuario);
          this.emailPendiente.next(null);
        }
      })
    );
  }

  reenviarCodigo(email: string): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/auth/resend-code`, { email });
  }

  olvideMiContrasena(email: string): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/auth/forgot-password`, { email });
  }

  restablecerContrasena(email: string, token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.urlApi}/auth/reset-password`, { 
      email, 
      token, 
      password,
      password_confirmation: password
    });
  }

  cerrarSesion(): void {
    this.almacenamiento.eliminarItem(entorno.claveToken);
    this.almacenamiento.eliminarItem(entorno.claveUsuario);
    this.almacenamiento.eliminarItem('carrito');
    this.usuarioActual.next(null);
    this.emailPendiente.next(null);
    this.router.navigate(['/autenticacion/inicio-sesion']);
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  estaAutenticado(): boolean {
    return !!this.almacenamiento.obtenerItem(entorno.claveToken);
  }

  obtenerToken(): string | null {
    return this.almacenamiento.obtenerItem(entorno.claveToken);
  }

  obtenerUsuario(): Usuario | null {
    return this.almacenamiento.obtenerItem<Usuario>(entorno.claveUsuario);
  }

  obtenerEmailPendiente(): string | null {
    return this.emailPendiente.value;
  }
}