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
  
  // ⭐ CLOUDINARY DIRECTO (IGUAL QUE PRODUCTOS)
  private readonly CLOUDINARY_CLOUD_NAME = 'dmrzrxjqc';
  private readonly CLOUDINARY_UPLOAD_PRESET = 'laneria-comprobantes';
  private readonly CLOUDINARY_FOLDER = 'laneria-mariano/comprobantes';
  
  // Comprobante
  comprobanteFile: File | null = null;
  previsualizacionComprobante: string | null = null;
  codigoOperacion = '';
  
  // Estados
  cargando = false;
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
   * Seleccionar archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe superar 10MB');
      return;
    }
    
    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG, GIF, WEBP o PDF');
      return;
    }
    
    // Guardar archivo
    this.comprobanteFile = file;
    
    // Generar preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previsualizacionComprobante = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Eliminar comprobante
   */
  eliminarComprobante(): void {
    this.comprobanteFile = null;
    this.previsualizacionComprobante = null;
    
    const fileInput = document.getElementById('comprobante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * ⭐ SUBIR IMAGEN A CLOUDINARY (IGUAL QUE PRODUCTOS)
   */
  private async subirImagenCloudinary(file: File): Promise<string> {
    console.log('📸 Subiendo comprobante a Cloudinary...', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', this.CLOUDINARY_FOLDER);

    const url = `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Comprobante subido a Cloudinary:', data.secure_url);
      return data.secure_url;
      
    } catch (error) {
      console.error('❌ Error al subir a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * ⭐ FINALIZAR COMPRA CON CLOUDINARY
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
      // 1️⃣ SUBIR COMPROBANTE A CLOUDINARY PRIMERO
      console.log('📸 Paso 1: Subiendo comprobante a Cloudinary...');
      const comprobanteUrl = await this.subirImagenCloudinary(this.comprobanteFile);
      console.log('✅ URL obtenida:', comprobanteUrl);

      // 2️⃣ CREAR VENTA CON COMPROBANTE INCLUIDO
      console.log('📦 Paso 2: Creando venta con comprobante...');
      const datos = {
        metodo_pago: 'Yape',
        direccion_envio: this.direccionEnvio,
        telefono_contacto: this.telefono,
        // ⭐ ENVIAR COMPROBANTE Y CÓDIGO
        comprobante_pago: comprobanteUrl,
        codigo_operacion: this.codigoOperacion
      };

      this.ventaService.crearVentaDesdeCarrito('Yape', undefined, datos).subscribe({
        next: (respuesta) => {
          console.log('✅ Venta creada con comprobante:', respuesta);
          
          alert(`¡Pedido realizado con éxito! 

Tu pedido está en revisión. 
Número de venta: ${respuesta.data.numero_venta || respuesta.data.venta_id}

Recibirás confirmación pronto.`);
          
          this.carritoService.cargarCarritoBackend();
          this.router.navigate(['/mis-pedidos']);
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al crear venta:', error);
          alert(error.error?.message || 'Error al procesar la compra');
          this.cargando = false;
        }
      });
      
    } catch (error: any) {
      console.error('❌ Error al subir comprobante:', error);
      alert('Error al subir comprobante: ' + error.message);
      this.cargando = false;
    }
  }
}