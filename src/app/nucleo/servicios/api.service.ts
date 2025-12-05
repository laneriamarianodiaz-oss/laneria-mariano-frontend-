import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { env } from 'process';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Obtiene los headers por defecto para las peticiones
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /**
   * GET - Obtener datos
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };
    return this.http.get<T>(url, options);
  }

  /**
   * POST - Crear recurso
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.post<T>(url, body, { headers: this.getHeaders() });
  }

  /**
   * PUT - Actualizar recurso
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.put<T>(url, body, { headers: this.getHeaders() });
  }

  /**
   * DELETE - Eliminar recurso
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.delete<T>(url, { headers: this.getHeaders() });
  }

  /**
   * POST - Para subir archivos (FormData)
   */
  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    // No se pone Content-Type para que el navegador lo configure automáticamente
    return this.http.post<T>(url, formData);
  }

  /**
   * Construir parámetros de URL
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }

  /**
   * Obtener URL completa de un asset
   */
  getAssetUrl(path: string): string {
    return `${environment.apiUrl}${path}`;
  }
}