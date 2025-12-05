import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../servicios/notificacion.service';
import { Notificacion } from '../../../../compartido/modelos/notificacion.modelo';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.notificacionService.notificaciones$.subscribe(notifs => {
      this.notificaciones = notifs.sort((a, b) => 
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      );
    });
  }

  marcarLeida(notif: Notificacion): void {
    notif.leida = true;
    console.log('Marcar como leída:', notif.id);
  }

  marcarTodasLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    console.log('Todas marcadas como leídas');
  }

  eliminar(notif: Notificacion): void {
    if (confirm('¿Eliminar esta notificación?')) {
      this.notificaciones = this.notificaciones.filter(n => n.id !== notif.id);
      console.log('Notificación eliminada:', notif.id);
    }
  }
}