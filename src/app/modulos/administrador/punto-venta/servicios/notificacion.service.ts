import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private audio?: HTMLAudioElement;

  /**
   * Reproducir sonido de notificación
   */
  reproducirSonido(): void {
    // Crear audio element con sonido de notificación
    this.audio = new Audio();
    this.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTR4NTK...'; // Base64 del sonido
    this.audio.load();
    this.audio.play().catch((error) => {
      console.warn('No se pudo reproducir el sonido:', error);
    });
  }

  /**
   * Mostrar notificación del navegador
   */
  mostrarNotificacionNavegador(titulo: string, mensaje: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, {
        body: mensaje,
        icon: '/assets/logo.png',
        badge: '/assets/badge.png',
      });
    }
  }

  /**
   * Solicitar permiso para notificaciones
   */
  async solicitarPermiso(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}