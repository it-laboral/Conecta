import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostulanteService } from '../../../services/postulante.service';

// ==========================================
// INTERFACES Y DTOs (Coincidentes con la BD)
// ==========================================
export interface SkillDTO {
  skill_id: number;
  categoria_id: number;
  nombre: string;
}

export interface CategoriaSkillDTO {
  categoria_id: number;
  nombre_categoria: string;
  skills: SkillDTO[];
}

export interface RedesDTO {
  github: string;
  linkedin: string;
  portfolio: string;
}

export interface PostulantePerfilDTO {
  // Datos fijos / académicos (Tabla: postulante)
  nombres: string;
  apellidos: string;
  email: string;
  carrera: string;

  // Datos editables del perfil (Tabla: perfil_postulante)
  foto?: string; // Almacena la ruta textual devuelta por el servidor (VARCHAR 255)
  ciudad: string;
  pais: string;
  sobre_mi: string;
  especialidad: string;
  estado_academico: string;

  // CV Adjunto
  cv_url?: string;
  cv_nombre?: string;

  // Relaciones
  skills: SkillDTO[];
  otras_habilidades?: string;
  redes: RedesDTO;
}

export function inicializarPerfilPostulante(): PostulantePerfilDTO {
  return {
    nombres: '',
    apellidos: '',
    email: '',
    carrera: '',
    foto: '',
    ciudad: '',
    pais: '',
    sobre_mi: '',
    especialidad: '',
    estado_academico: 'Estudiante Avanzado',
    cv_url: '',
    cv_nombre: '',
    skills: [],
    otras_habilidades: '',
    redes: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
  };
}

@Component({
  selector: 'app-postulante-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulante-profile.html',
  styleUrl: './postulante-profile.scss'
})
export class PostulanteProfile implements OnInit {

  private postulanteService = inject(PostulanteService);
  private platformId = inject(PLATFORM_ID);

  idPostulanteLogueado: number = 0;
  perfil: PostulantePerfilDTO = inicializarPerfilPostulante();

  guardando: boolean = false;
  mensajeEstado: string | null = null;

  modalActivo: 'principales' | 'sobreMi' | 'cv' | 'skills' | 'redes' | null = null;
  categoriasSkills: CategoriaSkillDTO[] = [];

  // Variables para la gestión de foto con Multer
  archivoFotoSeleccionado: File | null = null;
  fotoPreview: string | null = null; // Usado solo para vista previa inmediata en el HTML

  // Variables temporales para formularios
  tempUbicacion = { ciudad: '', pais: '' };
  tempSobreMi = { sobre_mi: '', especialidad: '', estado_academico: '' };
  tempRedes: RedesDTO = { github: '', linkedin: '', portfolio: '' };

  tempSkillsIds: number[] = [];
  tempOtrasHabilidades: string = '';
  busquedaSkill: string = '';

  archivoCVSeleccionado: File | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuario');
      if (usuarioSesion) {
        const userObj = JSON.parse(usuarioSesion);
        this.idPostulanteLogueado = userObj.id_postulante || userObj.id || 1;
      } else {
        this.idPostulanteLogueado = 1;
      }
    } else {
      this.idPostulanteLogueado = 1;
    }

    this.obtenerDatosDelPostulante();
    this.cargarCatalogoSkills();
  }

  // ==========================================
  // MANEJO DE FOTO DE PERFIL (MULTER)
  // ==========================================
  // 1. Obtiene la URL completa apuntando al Backend (Evita error 404 del puerto 4200)
  getFotoUrl(): string {
    if (this.fotoPreview) {
      return this.fotoPreview; // Muestra la vista previa DataURL inmediata
    }

    if (this.perfil && this.perfil.foto) {
      if (this.perfil.foto.startsWith('http')) {
        return this.perfil.foto;
      }
      // Redirige la petición al servidor Node.js (Puerto 3000)
      return `http://localhost:3000${this.perfil.foto}`;
    }

    // Ruta a una imagen por defecto si el usuario no tiene foto aún
    return 'assets/img/default-avatar.png';
  }
  // 2. Captura el archivo del <input type="file"> y genera vista previa local
  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida (.jpg o .png)');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }

      this.archivoFotoSeleccionado = file;

      // Genera vista previa temporal sin alterar perfil.foto
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Subida automática al seleccionar la foto
      this.subirFotoPerfil();
    }
  }

  // 2. Envía la imagen mediante FormData a la API (Evita Error 413)
 subirFotoPerfil(): void {
  if (!this.archivoFotoSeleccionado || !this.idPostulanteLogueado) return;

  // Se envía idPostulante y el objeto File directamente
  this.postulanteService.subirFotoPerfil(this.idPostulanteLogueado, this.archivoFotoSeleccionado).subscribe({
    next: (res: any) => {
      if (res.success || res.fotoUrl) {
        this.perfil.foto = res.fotoUrl || res.data;
        this.archivoFotoSeleccionado = null;
        this.fotoPreview = null;
        alert('¡Foto de perfil actualizada!');
      }
    },
    error: (err: any) => {
      console.error('Error al subir foto:', err);
      alert('Ocurrió un error al subir la foto de perfil.');
    }
  });
}

  // ==========================================
  // PERSISTENCIA DE TEXTO Y DATOS GENERALES
  // ==========================================
  guardarPerfilCompleto(): void {
    if (!this.idPostulanteLogueado) {
      alert('No se identificó la sesión del usuario.');
      return;
    }

    this.guardando = true;
    this.mensajeEstado = null;

    // Se envía el DTO con datos en texto plano
    this.postulanteService.actualizarPerfil(this.idPostulanteLogueado, this.perfil).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.success) {
          this.mensajeEstado = '¡Perfil guardado con éxito en la base de datos!';
          setTimeout(() => (this.mensajeEstado = null), 4000);
          this.obtenerDatosDelPostulante();
        }
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al guardar el perfil:', err);
        alert('Ocurrió un error al intentar persistir los datos.');
      }
    });
  }

  obtenerDatosDelPostulante(): void {
    if (!this.idPostulanteLogueado) return;

    this.postulanteService.getPerfil(this.idPostulanteLogueado).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.perfil = {
            ...inicializarPerfilPostulante(),
            ...res.data,
            skills: res.data.skills || [],
            redes: res.data.redes || { github: '', linkedin: '', portfolio: '' }
          };
        }
      },
      error: (err) => console.error('Error al obtener perfil desde backend:', err)
    });
  }

  cargarCatalogoSkills(): void {
    this.postulanteService.getCatalogoSkills().subscribe({
      next: (res) => {
        if (res.success) {
          this.categoriasSkills = res.data;
        }
      },
      error: (err) => console.error('Error al cargar catálogo de skills:', err)
    });
  }

  guardarCambiosEnBackend(): void {
    this.guardarPerfilCompleto();
  }

  // ==========================================
  // GESTIÓN DE MODALES Y FORMULARIOS
  // ==========================================
  abrirModal(tipo: 'principales' | 'sobreMi' | 'cv' | 'skills' | 'redes'): void {
    this.modalActivo = tipo;

    switch (tipo) {
      case 'principales':
        this.tempUbicacion = { ciudad: this.perfil.ciudad, pais: this.perfil.pais };
        break;
      case 'sobreMi':
        this.tempSobreMi = {
          sobre_mi: this.perfil.sobre_mi || '',
          especialidad: this.perfil.especialidad || '',
          estado_academico: this.perfil.estado_academico || 'Estudiante Avanzado'
        };
        break;
      case 'skills':
        this.busquedaSkill = '';
        this.tempSkillsIds = this.perfil.skills.map(s => s.skill_id);
        this.tempOtrasHabilidades = this.perfil.otras_habilidades || '';
        break;
      case 'redes':
        this.tempRedes = { ...this.perfil.redes };
        break;
      case 'cv':
        this.archivoCVSeleccionado = null;
        break;
    }
  }

  cerrarModal(): void {
    this.modalActivo = null;
  }

  guardarUbicacion(): void {
    this.perfil.ciudad = this.tempUbicacion.ciudad;
    this.perfil.pais = this.tempUbicacion.pais;
    this.guardarCambiosEnBackend();
    this.cerrarModal();
  }

  guardarSobreMi(): void {
    this.perfil.sobre_mi = this.tempSobreMi.sobre_mi;
    this.perfil.especialidad = this.tempSobreMi.especialidad;
    this.perfil.estado_academico = this.tempSobreMi.estado_academico;
    this.guardarCambiosEnBackend();
    this.cerrarModal();
  }

  onArchivoCVSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.archivoCVSeleccionado = file;
    } else {
      alert('Por favor seleccioná un archivo en formato PDF.');
    }
  }

  guardarCV(): void {
    if (this.archivoCVSeleccionado) {
      this.perfil.cv_nombre = this.archivoCVSeleccionado.name;
      this.perfil.cv_url = 'uploads/cv/' + this.archivoCVSeleccionado.name;
      this.guardarCambiosEnBackend();
    }
    this.cerrarModal();
  }

  get categoriasFiltradas(): CategoriaSkillDTO[] {
    const query = this.busquedaSkill.toLowerCase().trim();
    if (!query) return this.categoriasSkills;

    return this.categoriasSkills
      .map(cat => ({
        ...cat,
        skills: cat.skills.filter(s => s.nombre.toLowerCase().includes(query))
      }))
      .filter(cat => cat.skills.length > 0);
  }

  esSkillSeleccionada(skill_id: number): boolean {
    return this.tempSkillsIds.includes(skill_id);
  }

  toggleSkill(skill_id: number): void {
    const index = this.tempSkillsIds.indexOf(skill_id);
    if (index > -1) {
      this.tempSkillsIds.splice(index, 1);
    } else {
      this.tempSkillsIds.push(skill_id);
    }
  }

  guardarSkills(): void {
    const todas = this.categoriasSkills.flatMap(c => c.skills);
    this.perfil.skills = todas.filter(s => this.tempSkillsIds.includes(s.skill_id));
    this.perfil.otras_habilidades = this.tempOtrasHabilidades;
    this.guardarCambiosEnBackend();
    this.cerrarModal();
  }

  guardarRedes(): void {
    this.perfil.redes = { ...this.tempRedes };
    this.guardarCambiosEnBackend();
    this.cerrarModal();
  }
}