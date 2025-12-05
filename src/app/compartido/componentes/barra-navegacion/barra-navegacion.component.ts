import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { CarritoService } from '../../../modulos/carrito/servicios/carrito.service';

@Component({
  selector: 'app-barra-navegacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './barra-navegacion.component.html',
  styleUrl: './barra-navegacion.component.scss'
})
export class BarraNavegacionComponent implements OnInit {
  textoBusqueda = '';
  usuarioLogueado = false;
  nombreUsuario = '';
  cantidadCarrito = 0;
  menuAbierto = false;

  constructor(
    private authService: AutenticacionService,
    private carritoService: CarritoService,
    private router: Router  // ← AGREGAR ROUTER
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.usuarioLogueado = true;
        this.nombreUsuario = usuario.nombre;
      } else {
        this.usuarioLogueado = false;
        this.nombreUsuario = '';
      }
    });

    this.carritoService.carrito$.subscribe(carrito => {
      this.cantidadCarrito = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
    });
  }

  // ✅ NUEVO MÉTODO: Buscar productos
  buscarProductos(): void {
    if (this.textoBusqueda.trim()) {
      // Redirigir al catálogo completo con el parámetro de búsqueda
      this.router.navigate(['/catalogo/completo'], {
        queryParams: { busqueda: this.textoBusqueda.trim() }
      });
    }
  }

  // ✅ NUEVO MÉTODO: Buscar al presionar Enter
  onEnterBusqueda(event: Event): void {
    event.preventDefault();
    this.buscarProductos();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  obtenerIniciales(): string {
    if (!this.nombreUsuario) return 'U';
    const palabras = this.nombreUsuario.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return this.nombreUsuario.substring(0, 2).toUpperCase();
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    this.authService.cerrarSesion();
  }
}