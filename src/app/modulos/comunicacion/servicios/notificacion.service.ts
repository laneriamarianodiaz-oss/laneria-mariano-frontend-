import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { entorno } from '../../../../entornos/entorno';
import { Notificacion } from '../../../compartido/modelos/notificacion.modelo';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private urlApi = `${entorno.urlApi}/notificaciones`;
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarNotificaciones();
  }

  obtenerNotificaciones(): Observable<any> {
    return this.http.get<any>(this.urlApi);
  }

  marcarComoLeida(id: number): Observable<any> {
    return this.http.put<any>(`${this.urlApi}/${id}/leer`, {});
  }

  eliminarNotificacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlApi}/${id}`);
  }

  // Notificaciones de ejemplo
  private cargarNotificaciones(): void {
    const notificacionesEjemplo: Notificacion[] = [
      {
        id: 1,
        usuario_id: 1,
        titulo: '¡Pedido confirmado!',
        mensaje: 'Tu pedido #001 ha sido confirmado y está en preparación',
        tipo: 'exito',
        leida: false,
        fecha_creacion: '2025-01-14T10:30:00'
      },
      {
        id: 2,
        usuario_id: 1,
        titulo: 'Nuevo producto disponible',
        mensaje: 'Tenemos nuevos colores de lana disponibles',
        tipo: 'info',
        leida: true,
        fecha_creacion: '2025-01-13T15:20:00'
      },
      {
        id: 3,
        usuario_id: 1,
        titulo: 'Oferta especial',
        mensaje: '20% de descuento en amigurumis esta semana',
        tipo: 'advertencia',
        leida: false,
        fecha_creacion: '2025-01-12T09:00:00'
      }
    ];
    
    this.notificacionesSubject.next(notificacionesEjemplo);
  }

  obtenerNoLeidas(): number {
    return this.notificacionesSubject.value.filter(n => !n.leida).length;
  }
}