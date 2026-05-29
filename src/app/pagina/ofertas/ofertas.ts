
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- Este es el import que faltaba inyectar abajo

// Definición de la estructura de datos mejorada con Empresa
export interface Oferta {
  id?: number;
  titulo: string;
  empresa: string; // <-- Agregamos para que la tarjeta y el detalle tengan consistencia
  modalidad: string;
  experiencia: string;
  skills: string[];
  descripcion: string;
  fecha: Date;
}

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule], // <-- Incluido con éxito
  templateUrl: './ofertas.html',
  styleUrl: './ofertas.scss',
})
export class Ofertas implements OnInit {
  
  // Perfil simulado: Cambia a 'EMPRESA' para probar la carga e inserción desde ese rol
  rolUsuario: 'POSTULANTE' | 'EMPRESA' = 'POSTULANTE';

  mostrarFormulario: boolean = false;
  ofertaForm!: FormGroup;
  skillsSeleccionadas: string[] = [];
  
  // Variable para almacenar cuál oferta técnica está visualizando el usuario en el panel derecho
  ofertaSeleccionada: Oferta | null = null;

  // Banco de habilidades sugeridas para facilitarle a la empresa
  habilidadesSugeridas = [
    {
      categoria: 'Análisis de Sistemas & Desarrollo',
      items: ['Angular', 'Node.js', 'SQL Server', 'PostgreSQL', 'UML / Diagramas', 'Metodologías Ágiles', 'Git / GitHub', 'QA / Testing']
    },
    {
      categoria: 'Inteligencia Artificial & Datos',
      items: ['Python', 'Machine Learning', 'Ciencia de Datos', 'Deep Learning', 'Prompt Engineering', 'Power BI', 'NLP (Procesamiento de Lenguaje)']
    }
  ];

  // Agregamos empresas reales ficticias para poblar la vista
  ofertas: Oferta[] = [
    {
      id: 1,
      titulo: 'Analista de Sistemas Trainee',
      empresa: 'Sistemas Globales S.A.',
      modalidad: 'Híbrido',
      experiencia: 'Trainee',
      skills: ['SQL Server', 'UML / Diagramas', 'Metodologías Ágiles'],
      descripcion: 'Buscamos estudiante de los últimos años para relevamiento de requerimientos, armado de documentación de procesos de software y diagramación estructural.',
      fecha: new Date()
    },
    {
      id: 2,
      titulo: 'Desarrollador Backend Node.js Junior',
      empresa: 'Alpha Intelligence',
      modalidad: 'Remoto',
      experiencia: 'Junior',
      skills: ['Node.js', 'PostgreSQL', 'Git / GitHub'],
      descripcion: 'Súmate al equipo para el desarrollo, testing y optimización de las APIs REST de nuestros sistemas internos de intermediación.',
      fecha: new Date()
    }
  ];

  searchQuery: string = '';
  filtroModalidad: string = 'todos';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    
    // Autoseleccionar la primera oferta para que el panel derecho no inicie vacío
    if (this.ofertas.length > 0) {
      this.ofertaSeleccionada = this.ofertas[0];
    }
  }

  inicializarFormulario(): void {
    this.ofertaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      // Agregamos el control para que en el formulario la empresa ingrese su nombre
      empresa: ['Mi Empresa', Validators.required], 
      modalidad: ['Híbrido', Validators.required],
      experiencia: ['Junior', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  // Cambiar el foco del panel de detalle derecho
  seleccionarOferta(oferta: Oferta): void {
    this.ofertaSeleccionada = oferta;
  }

  // Método helper para validar si un campo debe mostrar error en la UI
  esCampoInvalido(campo: string): boolean {
    const control = this.ofertaForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleVista(verForm: boolean): void {
    this.mostrarFormulario = verForm;
    if (!verForm) {
      this.ofertaForm.reset({ modalidad: 'Híbrido', experiencia: 'Junior', empresa: 'Mi Empresa' });
      this.skillsSeleccionadas = [];
    }
  }

  // Permite seleccionar/deseleccionar las habilidades haciendo clic en los botones sugeridos
  alternarHabilidad(habilidad: string): void {
    const index = this.skillsSeleccionadas.indexOf(habilidad);
    if (index >= 0) {
      this.skillsSeleccionadas.splice(index, 1); // Si ya estaba, la saca
    } else {
      this.skillsSeleccionadas.push(habilidad); // Si no estaba, la agrega
    }
  }

  guardarOferta(): void {
    if (this.ofertaForm.invalid || this.skillsSeleccionadas.length === 0) {
      this.ofertaForm.markAllAsTouched();
      return;
    }

    const nuevaOferta: Oferta = {
      id: this.ofertas.length + 1,
      titulo: this.ofertaForm.value.titulo,
      empresa: this.ofertaForm.value.empresa,
      modalidad: this.ofertaForm.value.modalidad,
      experiencia: this.ofertaForm.value.experiencia,
      skills: [...this.skillsSeleccionadas],
      descripcion: this.ofertaForm.value.descripcion,
      fecha: new Date()
    };

    // Agregar al principio de la lista
    this.ofertas.unshift(nuevaOferta);
    
    // Auto-seleccionar la oferta recién creada para ver cómo quedó en las dos columnas
    this.ofertaSeleccionada = nuevaOferta;
    
    this.toggleVista(false);
  }

  // Simulación del botón de postulación del Postulante/Estudiante
  guardarPostulacion(): void {
    if (this.ofertaSeleccionada) {
      alert(`¡Postulación enviada! Has aplicado con éxito a la oferta de "${this.ofertaSeleccionada.titulo}" en ${this.ofertaSeleccionada.empresa}.`);
    }
  }

  get ofertasFiltradas(): Oferta[] {
    return this.ofertas.filter(o => {
      const cumpleBusqueda = o.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                             (o.empresa && o.empresa.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                             o.skills.some(s => s.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const cumpleModalidad = this.filtroModalidad === 'todos' || o.modalidad === this.filtroModalidad;
      return cumpleBusqueda && cumpleModalidad;
    });
  }
}