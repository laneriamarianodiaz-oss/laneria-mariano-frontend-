import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { BarraNavegacionComponent } from './compartido/componentes/barra-navegacion/barra-navegacion.component';
import { PiePaginaComponent } from './compartido/componentes/pie-pagina/pie-pagina.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BarraNavegacionComponent, PiePaginaComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'laneria-mariano-frontend';
  mostrarNavbarFooter = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Ocultar navbar y footer si la ruta empieza con /admin
        this.mostrarNavbarFooter = !event.url.startsWith('/admin');
      });
  }
}