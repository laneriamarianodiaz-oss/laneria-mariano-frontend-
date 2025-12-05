export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'administrador' | 'vendedor' | 'cliente';
  telefono?: string;
  dni?: string;
  created_at?: string;
}

export interface SolicitudLogin {
  email: string;
  password: string;
}

export interface RespuestaLogin {
  success: boolean;
  message: string;
  data: {
    user: Usuario;
    token: string;
  };
}

export interface EstadoAutenticacion {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
}