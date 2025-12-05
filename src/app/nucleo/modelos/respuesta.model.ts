export interface Respuesta<T = any> {
  ok: boolean;
  data?: T;
  mensaje?: string;
}
