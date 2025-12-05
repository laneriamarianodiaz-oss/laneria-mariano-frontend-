import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../../servicios/carrito.service';
import { VentaService } from '../../../../core/servicios/venta.service';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { ItemCarrito } from '../../../../compartido/modelos/carrito.modelo';
import { entorno } from '../../../../../entornos/entorno';

@Component({
  selector: 'app-finalizar-compra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finalizar-compra.component.html',
  styleUrl: './finalizar-compra.component.scss'
})
export class FinalizarCompraComponent implements OnInit {
  items: ItemCarrito[] = [];
  cantidadItems = 0;
  totalArticulos = 0;
  nombreUsuario = '';
  direccionEnvio = '';
  telefono = '';
  clienteId: number | null = null;
  
  // ✅ SOLO UNA VARIABLE PARA EL COMPROBANTE
  comprobanteFile: File | null = null;
  previsualizacionComprobante: string | null = null;
  
  // Datos del formulario
  codigoOperacion = '';
  
  // Estados
  cargando = false;
  subiendoComprobante = false;
  mostrarFormularioDireccion = false;

  constructor(
    private carritoService: CarritoService,
    private ventaService: VentaService,
    private authService: AutenticacionService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carritoService.carrito$.subscribe(carrito => {
      if (carrito) {
        this.items = carrito.items;
        this.cantidadItems = carrito.items.reduce((sum: number, item: any) => sum + item.cantidad, 0);
        this.totalArticulos = carrito.total;
      }
    });

    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.nombreUsuario = usuario.nombre;
        this.cargarDatosCliente(usuario.id);
      }
    });
    
    // Dirección por defecto
    this.direccionEnvio = 'Av Malinas S/n, Pacucha, Andahuaylas';
  }

  cargarDatosCliente(userId: number): void {
    this.http.get<any>(`${entorno.urlApi}/auth/mi-perfil`).subscribe({
      next: (respuesta) => {
        console.log('📞 Mi perfil:', respuesta);
        
        if (respuesta.success && respuesta.data.cliente) {
          const cliente = respuesta.data.cliente;
          this.clienteId = cliente.cliente_id;
          this.telefono = cliente.telefono || '000000000';
          
          if (cliente.direccion) {
            this.direccionEnvio = cliente.direccion;
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar perfil del cliente:', error);
      }
    });
  }

  cambiarDireccion(): void {
    this.mostrarFormularioDireccion = !this.mostrarFormularioDireccion;
  }

  /**
   * ✅ MÉTODO CORREGIDO - Maneja archivo Y genera preview
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar 5MB');
      return;
    }
    
    // Validar tipo
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Solo se permiten imágenes JPG o PNG');
      return;
    }
    
    // Guardar archivo
    this.comprobanteFile = file;
    
    // ✅ GENERAR PREVIEW PARA MOSTRAR EN HTML
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previsualizacionComprobante = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * ✅ ELIMINAR COMPROBANTE
   */
  eliminarComprobante(): void {
    this.comprobanteFile = null;
    this.previsualizacionComprobante = null;
    
    // Limpiar el input file
    const fileInput = document.getElementById('comprobante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * ✅ SUBIR COMPROBANTE AL BACKEND
   */
subirComprobante(ventaId: number): void {
  if (!this.comprobanteFile || !this.codigoOperacion) return;

  this.subiendoComprobante = true;
  
  // ✅ USAR FORMDATA
  const formData = new FormData();
  formData.append('comprobante', this.comprobanteFile);
  formData.append('codigo_operacion', this.codigoOperacion);

  this.http.post(`${entorno.urlApi}/ventas/${ventaId}/comprobante`, formData)
    .subscribe({
      next: (respuesta: any) => {
        console.log('✅ Comprobante subido:', respuesta);
        this.subiendoComprobante = false;
        alert('✅ Comprobante enviado correctamente');
      },
      error: (error) => {
        console.error('❌ Error al subir comprobante:', error);
        this.subiendoComprobante = false;
      }
    });
}

  /**
   * ✅ FINALIZAR COMPRA - CORREGIDO
   */
  async finalizarCompra(): Promise<void> {
    // Validaciones
    if (this.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!this.direccionEnvio.trim()) {
      alert('Por favor ingresa la dirección de envío');
      return;
    }

    if (!this.telefono.trim()) {
      alert('Por favor ingresa tu teléfono de contacto');
      return;
    }

    if (!this.codigoOperacion.trim()) {
      alert('Por favor ingresa el código de operación de Yape');
      return;
    }

    if (!this.comprobanteFile) {
      alert('Por favor sube el comprobante del pago');
      return;
    }

    if (!confirm(`¿Confirmar pedido por S/ ${this.totalArticulos.toFixed(2)}?`)) {
      return;
    }

    this.cargando = true;

    try {
      // ✅ PASO 1: Crear la venta (SIN el comprobante todavía)
      const datos = {
        metodo_pago: 'Yape',
        direccion_envio: this.direccionEnvio,
        telefono_contacto: this.telefono
        // ❌ NO enviar comprobante aquí
      };

      this.ventaService.crearVentaDesdeCarrito('Yape', undefined, datos).subscribe({
        next: (respuesta) => {
          console.log('✅ Venta creada:', respuesta);
          const ventaId = respuesta.data.venta_id;
          
          // ✅ PASO 2: Subir el comprobante DESPUÉS de crear la venta
          this.subirComprobante(ventaId);
          
          // ✅ PASO 3: Mostrar mensaje y redirigir
          alert(`¡Pedido realizado con éxito! 
          
Tu pedido está en revisión. 
Número de venta: ${respuesta.data.numero_venta || ventaId}`);
          
          this.carritoService.cargarCarritoBackend();
          this.router.navigate(['/mis-pedidos']); // ✅ Mejor redirigir a mis pedidos
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al finalizar compra:', error);
          alert(error.error?.message || 'Error al procesar la compra');
          this.cargando = false;
        }
      });
      
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      alert('Error al procesar la compra');
      this.cargando = false;
    }
  }
}