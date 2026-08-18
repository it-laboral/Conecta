import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule} from '@angular/common'; // Agregado para soportar directivas estructurales si hiciese falta
import { OfertaService } from '../../services/oferta_service'; // Ruta de servicio
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { AuthService } from '../../services/auth.service';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule], 
  templateUrl: './ofertas.html',
  styleUrl: './ofertas.scss',
})
export class Ofertas implements OnInit {
  
  // Datos de sesión dinámicos (Obtenidos del Login real)
  rolUsuario: string | null = ''; 
  idUsuario: string | null = '';
  nombreUsuario: string | null = '';

  mostrarFormulario: boolean = false;
  ofertaForm!: FormGroup;
  
  // Manejo de habilidades dinámicas (BD)
  categoriasConSkills: any[] = []; 
  skillsSeleccionadasIds: number[] = []; // Guardamos los IDs numéricos para la tabla intermedia de MySQL

  // Listados de ofertas reales provenientes del Backend
  ofertasDeBaseDeDatos: any[] = [];
  ofertasFiltradas: any[] = [];
  ofertaSeleccionada: any = null;

  searchQuery: string = '';
  filtroModalidad: string = 'todos';

  constructor(
    private fb: FormBuilder,
    private ofertaService: OfertaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Capturar credenciales REALES desde el AuthService (localStorage)
    const usuarioLogueado = this.authService.getUsuarioActual();
    
    // Convertimos 'empresa' / 'postulante' a mayúsculas para mantener tu lógica de vista
    this.rolUsuario = (this.authService.getTipoUsuario() || 'POSTULANTE').toUpperCase(); 
    this.idUsuario = usuarioLogueado ? String(usuarioLogueado.id) : null;
    this.nombreUsuario = usuarioLogueado ? usuarioLogueado.nombre : 'Usuario';
    

    // 2. Inicializar controles reactivos
    this.inicializarFormulario();

    // 3. Cargar datos vivos desde XAMPP / Node.js
    this.cargarOfertasDesdeBackend();
    this.cargarHabilidadesYCategorias();
  }

  inicializarFormulario(): void {
    this.ofertaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      modalidad: ['Híbrido', Validators.required],
      experiencia: ['Junior', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      // Nuevos campos de control para la duración del Sprint
      tipoDuracion: ['10', Validators.required],
      diasPersonalizados: [null]
    });
  }

  // Carga inicial del Feed utilizando el OfertaService
  cargarOfertasDesdeBackend(): void {
    this.ofertaService.getOfertasVigentes().subscribe({
      next: (data) => {
        this.ofertasDeBaseDeDatos = data;
        this.ofertasFiltradas = [...data];
        this.seleccionarPrimeraDisponible(this.ofertasFiltradas);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar ofertas del backend:', err)
    });
  }

  // Carga las categorías y habilidades del ITB mapeadas desde las tablas maestras de MySQL
  cargarHabilidadesYCategorias(): void {
    // Aquí llamarías a un endpoint en tu servicio, por ejemplo:
   // this.ofertaService.getCategoriasConSkills().subscribe(data => this.categoriasConSkills = data);
    
    // Simulación alineada a tu nueva estructura relacional de 3 tablas de XAMPP:
    this.categoriasConSkills = [
      {
        categoria_id: 1,
        nombre: 'Análisis de Sistemas & Desarrollo',
        skills: [
          { skill_id: 1, nombre: 'Angular' }, { skill_id: 2, nombre: 'Node.js' }, 
          { skill_id: 3, nombre: 'MySQL' }, { skill_id: 4, nombre: 'PostgreSQL' },
          { skill_id: 5, nombre: 'Git / GitHub' }, { skill_id: 6, nombre: 'Metodologías Ágiles' },
          { skill_id: 7, nombre: 'TypeScript' }, { skill_id: 8, nombre: 'JavaScript'}, 
          { skill_id: 9, nombre: 'HTML & CSS / SCSS' }
        ]
      },
      {
        categoria_id: 2,
        nombre: 'Inteligencia Artificial & Datos',
        skills: [
          { skill_id: 10, nombre: 'Python' }, { skill_id: 11, nombre: 'TensorFlow' }, 
          { skill_id: 12, nombre: 'Machine Learning' }, { skill_id: 13, nombre: 'Deep Learning' },
          { skill_id: 14, nombre: 'Prompt Engineering' }, { skill_id: 15, nombre: 'Power BI' },
          { skill_id: 16, nombre: 'Ciencia de Datos' }, { skill_id: 17, nombre: 'SQL Server' }, 
          { skill_id: 18, nombre: 'Modelos de Lenguaje' }
        ]
      }
    ];
  }

  // Escucha cambios en el combo de duración y aplica/remueve validadores dinámicamente
  onTipoDuracionChange(): void {
    const tipo = this.ofertaForm.get('tipoDuracion')?.value;
    const controlDias = this.ofertaForm.get('diasPersonalizados');

    if (tipo === 'personalizado') {
      controlDias?.setValidators([Validators.required, Validators.min(1), Validators.max(90)]);
    } else {
      controlDias?.clearValidators();
      controlDias?.setValue(null);
    }
    controlDias?.updateValueAndValidity();
  }

  // Alterna la selección de IDs en los Chips
  alternarHabilidad(skill_Id: number): void {
    const index = this.skillsSeleccionadasIds.indexOf(skill_Id);
    if (index > -1) {
      this.skillsSeleccionadasIds.splice(index, 1);
    } else {
      this.skillsSeleccionadasIds.push(skill_Id);
    }
    // Esto fuerza a Angular a enterarse de que el array cambió para actualizar los colores
      this.skillsSeleccionadasIds = [...this.skillsSeleccionadasIds];
  }

  seleccionarOferta(oferta: any): void {
    if (!oferta) return; // Evitamos seleccionar una oferta nula o indefinida
    this.ofertaSeleccionada = {
      ...oferta,id_oferta: oferta.id_oferta, 
      dias_duracion: oferta.dias_duracion || oferta.diasDuracion || 10,
      skills_nombres: oferta.skills_nombres || []
    };

  }

  private seleccionarPrimeraDisponible(lista: any[]): void {
    if (lista.length > 0) {
      const primera = lista[0];
      this.ofertaSeleccionada = {
        ...primera,
        id_oferta: primera.id_oferta || primera.id, 
        dias_duracion: primera.dias_duracion || primera.diasDuracion || 10,
        skills_nombres: primera.skills_nombres || []
      };
    } else {
      this.ofertaSeleccionada = null;
    }
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.ofertaForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleVista(verForm: boolean): void {
    this.mostrarFormulario = verForm;
    if (!verForm) {
      this.ofertaForm.reset({ modalildad: 'Híbrido', experiencia: 'Junior', tipoDuracion: '10' });
      this.skillsSeleccionadasIds = [];
    }
  }

  // Filtrado reactivo local directo en memoria para no saturar al servidor con peticiones GET continuas
  filtrarOfertasLocal(): void {
    this.ofertasFiltradas = this.ofertasDeBaseDeDatos.filter(o => {
      const cumpleBusqueda = o.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                             (o.razonSocial && o.razonSocial.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                             (o.skills_nombres && o.skills_nombres.some((s: string) => s.toLowerCase().includes(this.searchQuery.toLowerCase())));
      
      const cumpleModalidad = this.filtroModalidad === 'todos' || o.modalidad === this.filtroModalidad;
      return cumpleBusqueda && cumpleModalidad;
    });

    this.sincronizarSeleccionDerecha();
  }

  cambiarFiltroModalidad(modalidad: string): void {
    this.filtroModalidad = modalidad;
    this.filtrarOfertasLocal();
  }

  private sincronizarSeleccionDerecha(): void {
    if (this.ofertaSeleccionada && !this.ofertasFiltradas.includes(this.ofertaSeleccionada)) {
      this.seleccionarPrimeraDisponible(this.ofertasFiltradas);
    } else if (!this.ofertaSeleccionada && this.ofertasFiltradas.length > 0) {
      this.seleccionarPrimeraDisponible(this.ofertasFiltradas);
    }
  }

  // Guardar la oferta conectándolo al backend real
  guardarOferta(): void {
    if (this.ofertaForm.invalid || this.skillsSeleccionadasIds.length === 0) {
      this.ofertaForm.markAllAsTouched();
      return;
    }

    const confirmar = confirm('¡Atención! Por favor, revise detalladamente los datos ingresados y habilidades seleccionadas antes de publicar. ¿Está todo correcto?');
  
    if (!confirmar) {
    return; // Si el usuario toca "Cancelar"
    }

    const fValue = this.ofertaForm.value;
    // Determinamos si van 10 días fijos o el número personalizado digitado por la empresa
    const diasFinales = fValue.tipoDuracion === 'personalizado' ? fValue.diasPersonalizados : 10;

    const payloadNuevaOferta = {
      id_empresa: Number(this.idUsuario || 0), // ID real extraído del AuthService
      titulo: fValue.titulo,
      descripcion: fValue.descripcion,
      modalidad: fValue.modalidad,
      experiencia: fValue.experiencia,
      dias_duracion: diasFinales,
      skill: [...this.skillsSeleccionadasIds], // Enviamos el array de IDs enteros [1, 4, 7]
      skills: [...this.skillsSeleccionadasIds] // Enviamos el array de IDs enteros [1, 4, 7]
    };

    this.ofertaService.publicarOferta(payloadNuevaOferta).subscribe({
      next: (res) => {
        if (res.OK) {
          alert('¡Oferta guardada con éxito en la base de datos!');
          this.toggleVista(false);
          this.cargarOfertasDesdeBackend(); // Recargar el feed completo para traer la nueva
        }
      },
      error: (err) => console.error('Error al insertar la oferta:', err)
    });
  }

  guardarPostulacion(ofertaId: number): void {
    alert(`Postulación enviada. ID de Oferta: ${ofertaId}. ID de Alumno: ${this.idUsuario}`);
    // Acá llamarías a tu servicio para insertar en la tabla intermedia de postulaciones
  }

  bajaOfertaAdmin(ofertaId: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta oferta de manera permanente como Administrador?')) {
      alert(`Oferta N° ${ofertaId} eliminada por moderación.`);
      // Acá procesarías la llamada DELETE al endpoint del backend
    }
  }
}