export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;  // Esta línea debe estar
  direccion?: string; // Esta línea debe estar
  rol: 'admin' | 'cliente';
  estado: 'activo' | 'inactivo';
}

export interface SolicitudLogin {
  email: string;
  password: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}