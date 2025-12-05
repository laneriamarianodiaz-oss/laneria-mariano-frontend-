import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { entorno } from '../../../../entornos/entorno';
import { Producto } from '../../../compartido/modelos/producto.modelo';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private urlApi = `${entorno.urlApi}/productos`;

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<any> {
    return this.http.get<any>(this.urlApi);
  }

  obtenerProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlApi}/${id}`);
  }


}