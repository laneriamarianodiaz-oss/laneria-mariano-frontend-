import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlmacenamientoService {

  constructor() { }

  guardarItem(clave: string, valor: any): void {
    try {
      const valorSerializado = JSON.stringify(valor);
      localStorage.setItem(clave, valorSerializado);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }

obtenerItem<T>(clave: string): T | null {
  if (typeof localStorage === 'undefined') {
    return null; 
  }
  try {
    const item = localStorage.getItem(clave);
    if (item) {
      return JSON.parse(item) as T;
    }
    return null;
  } catch (error) {
    console.error('Error al leer:', error);
    return null;
  }
}

  eliminarItem(clave: string): void {
    try {
      localStorage.removeItem(clave);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }

  limpiar(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar:', error);
    }
  }
}