import { Component, EventEmitter, Input, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto, ProductoFormulario, CATEGORIAS, COLORES } from '../../modelos/producto.model';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-producto.component.html',
  styleUrl: './formulario-producto.component.css'
})
export class FormularioProductoComponent implements OnInit {
  
  @Input() producto: Producto | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();

  private productoService = inject(ProductoService);

  // ✅ CONFIGURACIÓN CLOUDINARY
  private readonly CLOUDINARY_CLOUD_NAME = 'dmrzrxjqc';
  private readonly CLOUDINARY_UPLOAD_PRESET = 'laneria-productos';
  private readonly CLOUDINARY_FOLDER = 'laneria-mariano/productos';

  parseFloat = parseFloat;
  parseInt = parseInt;

  // Opciones
  categorias = CATEGORIAS;
  colores = COLORES;

  // Formulario (sin tipo_lana y proveedor_id)
  formulario = signal<ProductoFormulario>({
    codigo_lana: '',
    nombre: '',
    tipo_lana: '', // Se mantiene por compatibilidad pero no se usa
    categoria: '',
    color: '',
    talla_tamano: '',
    precio_unitario: 0,
    stock: 0,
    stock_minimo: 0,
    proveedor_id: undefined, // Se mantiene por compatibilidad pero no se usa
    estado: 'activo',
    descripcion: ''
  });

  // Imágenes
  imagenesSeleccionadas = signal<File[]>([]);
  imagenesPreview = signal<string[]>([]);

  // Estados
  guardando = signal(false);
  subiendoImagen = signal(false);

  ngOnInit(): void {
    if (this.producto) {
      this.cargarDatosProducto();
    }
  }

  /**
   * Cargar datos del producto para edición
   */
  cargarDatosProducto(): void {
    if (!this.producto) return;

    this.formulario.set({
      codigo_lana: this.producto.codigo_lana,
      nombre: this.producto.nombre,
      tipo_lana: '', // Ya no se usa
      categoria: this.producto.categoria,
      color: this.producto.color,
      talla_tamano: this.producto.talla_tamano || '',
      precio_unitario: this.producto.precio_unitario,
      stock: this.producto.stock,
      stock_minimo: this.producto.stock_minimo,
      proveedor_id: undefined, // Ya no se usa
      estado: this.producto.estado,
      descripcion: this.producto.descripcion || ''
    });

    // Cargar imágenes existentes
    if (this.producto.imagenes) {
      this.imagenesPreview.set([...this.producto.imagenes]);
    }
  }

  /**
   * Manejar selección de imágenes
   */
  onImagenesSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivos = Array.from(input.files);
    const archivosValidos: File[] = [];

    // Validar cantidad máxima
    const totalImagenes = this.imagenesSeleccionadas().length + archivos.length;
    if (totalImagenes > 5) {
      alert('Máximo 5 imágenes permitidas');
      return;
    }

    // Validar y crear previews
    archivos.forEach(archivo => {
      // Validar tipo
      if (!archivo.type.startsWith('image/')) {
        alert(`${archivo.name} no es una imagen válida`);
        return;
      }

      // Validar tamaño (máx 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert(`${archivo.name} supera el tamaño máximo de 5MB`);
        return;
      }

      archivosValidos.push(archivo);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imagenesPreview.update(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(archivo);
    });

    this.imagenesSeleccionadas.update(prev => [...prev, ...archivosValidos]);
  }

  /**
   * 📸 SUBIR IMAGEN DIRECTAMENTE A CLOUDINARY
   */
  private async subirImagenCloudinary(file: File): Promise<string> {
    console.log('📸 Subiendo imagen a Cloudinary...', file.name);
    
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
      console.log('✅ Imagen subida a Cloudinary:', data.secure_url);
      return data.secure_url;
      
    } catch (error) {
      console.error('❌ Error al subir a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Eliminar imagen
   */
  eliminarImagen(index: number): void {
    this.imagenesSeleccionadas.update(imagenes => {
      const nuevas = [...imagenes];
      nuevas.splice(index, 1);
      return nuevas;
    });
    
    this.imagenesPreview.update(previews => {
      const nuevas = [...previews];
      nuevas.splice(index, 1);
      return nuevas;
    });
  }

  /**
   * Validar formulario (SIN tipo_lana)
   */
  private validarFormulario(): boolean {
    const form = this.formulario();
    
    if (!form.codigo_lana || form.codigo_lana.trim() === '') {
      alert('❌ El código de producto es obligatorio');
      return false;
    }
    
    if (!form.nombre || form.nombre.trim() === '') {
      alert('❌ El nombre del producto es obligatorio');
      return false;
    }
    
    if (!form.categoria) {
      alert('❌ La categoría es obligatoria');
      return false;
    }
    
    if (form.precio_unitario <= 0) {
      alert('❌ El precio debe ser mayor a 0');
      return false;
    }
    
    if (form.stock < 0) {
      alert('❌ El stock no puede ser negativo');
      return false;
    }
    
    if (form.stock_minimo < 0) {
      alert('❌ El stock mínimo no puede ser negativo');
      return false;
    }
    
    return true;
  }

  /**
   * ✅ GUARDAR PRODUCTO (SIN tipo_lana y proveedor_id)
   */
  async guardarProducto(): Promise<void> {
    if (!this.validarFormulario()) return;

    this.guardando.set(true);
    const form = this.formulario();
    
    try {
      // 📸 PASO 1: SUBIR IMAGEN A CLOUDINARY SI HAY
      let imagenUrl: string | null = null;
      const imagenes = this.imagenesSeleccionadas();
      
      if (imagenes.length > 0) {
        this.subiendoImagen.set(true);
        console.log('📸 Subiendo imagen a Cloudinary...');
        imagenUrl = await this.subirImagenCloudinary(imagenes[0]);
        console.log('✅ URL obtenida de Cloudinary:', imagenUrl);
        this.subiendoImagen.set(false);
      }

      // 📦 PASO 2: PREPARAR DATOS (SIN tipo_de_producto y proveedor_id)
      const productoData: any = {
        codigo_producto: form.codigo_lana.trim(),
        nombre_producto: form.nombre.trim(),
        tipo_de_producto: 'General', // Valor por defecto
        categoria: form.categoria,
        precio_producto: form.precio_unitario,
        stock_disponible: form.stock,
        stock_minimo: form.stock_minimo,
        estado_producto: form.estado === 'activo' ? 'Activo' : 'Inactivo'
      };

      // Campos opcionales
      if (form.color && form.color.trim()) {
        productoData.color_producto = form.color.trim();
      }
      
      if (form.talla_tamano && form.talla_tamano.trim()) {
        productoData.talla_producto = form.talla_tamano.trim();
      }
      
      if (form.descripcion && form.descripcion.trim()) {
        productoData.descripcion = form.descripcion.trim();
      }

      // ⭐ AGREGAR URL DE CLOUDINARY
      if (imagenUrl) {
        productoData.imagen_url = imagenUrl;
      }

      console.log('=== DATOS A ENVIAR AL BACKEND ===');
      console.log(productoData);

      // 🚀 PASO 3: ENVIAR AL BACKEND
      const operacion = this.producto
        ? this.productoService.actualizarProducto(this.producto.id, productoData)
        : this.productoService.crearProducto(productoData);

      operacion.subscribe({
        next: (response) => {
          console.log('✅ Producto guardado:', response);
          alert(this.producto ? '✅ Producto actualizado correctamente' : '✅ Producto creado correctamente');
          this.guardar.emit();
          this.guardando.set(false);
        },
        error: (error) => {
          console.error('❌ Error al guardar producto:', error);
          
          if (error.error && error.error.errors) {
            const errores = Object.entries(error.error.errors)
              .map(([campo, mensajes]: [string, any]) => `• ${campo}: ${mensajes.join(', ')}`)
              .join('\n');
            alert(`❌ Errores de validación:\n\n${errores}`);
          } else if (error.error && error.error.message) {
            alert(`❌ Error: ${error.error.message}`);
          } else {
            alert('❌ Error al guardar el producto. Revisa la consola.');
          }
          
          this.guardando.set(false);
        }
      });

    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      alert('❌ Error al subir la imagen a Cloudinary. Intenta de nuevo.');
      this.guardando.set(false);
      this.subiendoImagen.set(false);
    }
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    if (this.guardando()) return;
    this.cerrar.emit();
  }

  /**
   * Actualizar campo del formulario
   */
  actualizarCampo(campo: keyof ProductoFormulario, valor: any): void {
    this.formulario.update(form => ({
      ...form,
      [campo]: valor
    }));
  }
}