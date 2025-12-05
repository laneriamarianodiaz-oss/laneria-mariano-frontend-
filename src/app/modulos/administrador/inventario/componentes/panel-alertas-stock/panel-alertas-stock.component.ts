import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasInventario } from '../../modelos/inventario.model';

@Component({
  selector: 'app-panel-alertas-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-alertas-stock.component.html',
  styleUrl: './panel-alertas-stock.component.css'
})
export class PanelAlertasStockComponent {
  @Input() estadisticas!: EstadisticasInventario;
}