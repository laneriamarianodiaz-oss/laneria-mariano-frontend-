import { Component, EventEmitter, Input, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../servicios/producto.service';
import { Producto, ProductoFormulario, CATEGORIAS, TIPOS_LANA, COLORES } from '../../modelos/producto.model';

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

  // ✅ AGREGAR ESTAS PROPIEDADES
  parseFloat = parseFloat;
  parseInt = parseInt;

  // Opciones
  categorias = CATEGORIAS;
  tiposLana = TIPOS_LANA;
  colores = COLORES;
  proveedores = signal<any[]>([]);

  // Formulario
formulario = signal<ProductoFormulario>({
  codigo_lana: '',
  nombre: '',
  tipo_lana: '',
  categoria: '',
  color: '',
  talla_tamano: '',
  precio_unitario: 0,
  stock: 0,
  stock_minimo: 0,
  proveedor_id: undefined,  // ✅ CAMBIAR de 0 a undefined
  estado: 'activo',
  descripcion: ''
});

  // Imágenes
  imagenesSeleccionadas = signal<File[]>([]);
  imagenesPreview = signal<string[]>([]);

  // Estados
  guardando = signal(false);

  ngOnInit(): void {
    if (this.producto) {
      this.cargarDatosProducto();
    }
    this.cargarProveedores();
  }

  /**
   * Cargar datos del producto para edición
   */
  cargarDatosProducto(): void {
    if (!this.producto) return;

    this.formulario.set({
      codigo_lana: this.producto.codigo_lana,
      nombre: this.producto.nombre,
      tipo_lana: this.producto.tipo_lana,
      categoria: this.producto.categoria,
      color: this.producto.color,
      talla_tamano: this.producto.talla_tamano || '',
      precio_unitario: this.producto.precio_unitario,
      stock: this.producto.stock,
      stock_minimo: this.producto.stock_minimo,
proveedor_id: this.producto.proveedor_id || undefined,
      estado: this.producto.estado,
      descripcion: this.producto.descripcion || ''
    });

    // Cargar imágenes existentes
    if (this.producto.imagenes) {
      this.imagenesPreview.set([...this.producto.imagenes]);
    }
  }

  /**
   * Cargar proveedores
   */
  cargarProveedores(): void {
    // Aquí deberías llamar al servicio de proveedores
    // Por ahora usamos datos de prueba
    this.proveedores.set([
      { id: 1, nombre: 'Textiles San Juan' },
      { id: 2, nombre: 'Lanas del Sur' },
      { id: 3, nombre: 'Importadora Lima' }
    ]);
  }

  /**
   * Manejar selección de imágenes
   */
  onImagenesSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivos = Array.from(input.files);
    const archivosValidos: File[] = [];
    const previews: string[] = [];

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

      // Validar tamaño (máx 2MB)
      if (archivo.size > 2 * 1024 * 1024) {
        alert(`${archivo.name} supera el tamaño máximo de 2MB`);
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
   * Validar formulario
   */
private validarFormulario(): boolean {
  const form = this.formulario();
  
  // ✅ VALIDACIONES OBLIGATORIAS
  if (!form.codigo_lana || form.codigo_lana.trim() === '') {
    alert('❌ El código de lana es obligatorio');
    return false;
  }
  
  if (!form.nombre || form.nombre.trim() === '') {
    alert('❌ El nombre del producto es obligatorio');
    return false;
  }
  
  if (!form.tipo_lana) {
    alert('❌ El tipo de lana es obligatorio');
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
 * Guardar producto
 */
guardarProducto(): void {
  if (!this.validarFormulario()) return;

  this.guardando.set(true);
  const form = this.formulario();
  
  // ✅ VALIDAR QUE TENGA CÓDIGO
  if (!form.codigo_lana || form.codigo_lana.trim() === '') {
    alert('❌ El código de lana es obligatorio');
    this.guardando.set(false);
    return;
  }
  
  const formData = new FormData();
  
  // ✅ CAMPOS OBLIGATORIOS - NOMBRES EXACTOS DEL BACKEND
  formData.append('codigo_producto', form.codigo_lana.trim());
  formData.append('nombre_producto', form.nombre.trim());
  formData.append('tipo_de_producto', form.tipo_lana);
  formData.append('categoria', form.categoria);  // ⭐ CATEGORÍA AGREGADA
  formData.append('precio_producto', form.precio_unitario.toString());
  formData.append('stock_disponible', form.stock.toString());
  formData.append('stock_minimo', form.stock_minimo.toString());
  formData.append('estado_producto', form.estado === 'activo' ? 'Activo' : 'Inactivo');
  
  // ✅ CAMPOS OPCIONALES
  if (form.color && form.color.trim()) {
    formData.append('color_producto', form.color.trim());
  }
  
  if (form.talla_tamano && form.talla_tamano.trim()) {
    formData.append('talla_producto', form.talla_tamano.trim());
  }
  
  if (form.descripcion && form.descripcion.trim()) {
    formData.append('descripcion', form.descripcion.trim());
  }
  
  // ✅ PROVEEDOR: Solo enviar si tiene valor válido
  if (form.proveedor_id && form.proveedor_id > 0) {
    formData.append('proveedor_id', form.proveedor_id.toString());
  }
  
  // ✅ IMÁGENES
const imagenes = this.imagenesSeleccionadas();
if (imagenes.length > 0) {
  formData.append('imagen', imagenes[0]); // ← Envía el archivo File completo
}
  // ✅ DEBUG: Ver qué se está enviando
  console.log('=== DATOS A ENVIAR AL BACKEND ===');
  formData.forEach((value, key) => {
    console.log(`${key}:`, value);
  });

  const operacion = this.producto
    ? this.productoService.actualizarProducto(this.producto.id, formData)
    : this.productoService.crearProducto(formData);

  operacion.subscribe({
    next: (response) => {
      console.log('✅ Producto guardado:', response);
      alert(this.producto ? '✅ Producto actualizado correctamente' : '✅ Producto creado correctamente');
      this.guardar.emit();
      this.guardando.set(false);
    },
    error: (error) => {
      console.error('❌ Error completo:', error);
      console.error('❌ Error.error:', error.error);
      
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