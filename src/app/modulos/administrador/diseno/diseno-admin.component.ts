import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuLateralComponent } from '../../../compartido/componentes/menu-lateral/menu-lateral.component';
import { BarraNavegacionComponent } from '../../../compartido/componentes/barra-navegacion/barra-navegacion.component';

@Component({
  selector: 'app-diseno-admin',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MenuLateralComponent, 
    BarraNavegacionComponent
  ],
  templateUrl: './diseno-admin.component.html',
  styleUrl: './diseno-admin.component.css'  // ✅ CAMBIADO A CSS
})
export class DisenoAdminComponent {
  
  sidebarCollapsed = signal(false);

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}