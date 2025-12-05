import { Producto } from './producto.modelo';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface Carrito {
  items: ItemCarrito[];
  total: number;
}