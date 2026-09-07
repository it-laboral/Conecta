import { Component, OnInit, inject, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router} from '@angular/router';
import { PostulanteService } from '../../../services/postulante.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// ==========================================
// INTERFACES Y DTOs
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
  nombres: string;
  apellidos: string;
  email: string;
  carrera: string;
  foto?: string;
  ciudad: string;
  pais: string;
  sobre_mi: string;
  especialidad: string;
  estado_academico: string;
  cv_url?: string;
  cv_nombre?: string;
  skills: SkillDTO[];
  otras_habilidades?: string;
  redes: RedesDTO;
}

// ==========================================
// PERFIL INICIAL
// ==========================================

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

// ==========================================
// COMPONENTE
// ==========================================

@Component({
  selector: 'app-postulante-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulante-profile.html',
  styleUrl: './postulante-profile.scss'
})
export class PostulanteProfile implements OnInit {

  // SERVICIOS
  private postulanteService = inject(PostulanteService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  
  // MODO RECLUTADOR (Si viene desde vista de empresas/reclutador)
  @Input() esVistaReclutador: boolean = false;

  // DATOS DEL USUARIO
  idPostulanteLogueado: number = 0;
  perfil: PostulantePerfilDTO = inicializarPerfilPostulante();

  // ESTADOS
  guardando: boolean = false;
  mensajeEstado: string | null = null;
  mostrarVistaPreviaCV: boolean = false;
  cvPreviewUrl: SafeResourceUrl | null = null;

  // MODALES
  modalActivo: 'principales' | 'sobreMi' | 'skills' | 'redes' | null = null;

  // SKILLS
  categoriasSkills: CategoriaSkillDTO[] = [];
  tempSkillsIds: number[] = [];
  tempOtrasHabilidades: string = '';
  busquedaSkill: string = '';

  // FOTO
  archivoFotoSeleccionado: File | null = null;
  fotoPreview: string | null = null;

  // FORMULARIOS TEMPORALES
  tempUbicacion = {
    ciudad: '',
    pais: ''
  };

  tempSobreMi = {
    sobre_mi: '',
    especialidad: '',
    estado_academico: ''
  };

  tempRedes: RedesDTO = {
    github: '',
    linkedin: '',
    portfolio: ''
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuario');
      if (usuarioSesion) {
        try {
          const userObj = JSON.parse(usuarioSesion);
          this.idPostulanteLogueado = userObj.id_postulante || userObj.id || 1;
        } catch (error) {
          console.error('Error al leer usuario de localStorage:', error);
          this.idPostulanteLogueado = 1;
        }
      } else {
        this.idPostulanteLogueado = 1;
      }
    } else {
      this.idPostulanteLogueado = 1;
    }

    this.obtenerDatosDelPostulante();
    this.cargarCatalogoSkills();
  }

  /// ==========================================
  // GESTIÓN DE CURRICULUM VITAE
  // ==========================================

  // Construye la ruta absoluta conectando con el backend
  private obtenerUrlCV(): string | null {
    if (!this.perfil?.cv_url) return null;
    const backendUrl = 'http://localhost:3000'; // Puerto del backend Node.js
    return this.perfil.cv_url.startsWith('http')
      ? this.perfil.cv_url
      : `${backendUrl}${this.perfil.cv_url}`;
  }

  // Botón "📝 Ir a Curriculum" / "✏️"
  irACurriculum(): void {
    this.router.navigate(['/perfil/curriculum']);
  }

  // Botón "👁️ Ver / Previsualizar"
  // 1. ABRIR EL MODAL Y SANITIZAR LA URL
  verCV(): void {
    const rawUrl = this.obtenerUrlCV();

    if (rawUrl) {
      // bypassSecurityTrustResourceUrl permite que el <iframe> cargue el PDF sin errores de Angular
      this.cvPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      this.mostrarVistaPreviaCV = true;
    } else {
      this.irACurriculum();
    }
  }

  // 2. CERRAR EL MODAL
  cerrarVistaPreviaCV(): void {
    this.mostrarVistaPreviaCV = false;
    this.cvPreviewUrl = null; // Limpia la URL para liberar memoria
  }
  // 3 Botón "⬇️ Descargar"
  async descargarCV(): Promise<void> {
    const url = this.obtenerUrlCV();

    if (!url) {
      this.irACurriculum();
      return;
    }

    try {
      // Descarga el PDF como Blob para saltarse el bloqueo CORS del navegador
      const respuesta = await fetch(url);
      const blob = await respuesta.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = this.perfil.cv_nombre || `CV_${this.perfil.nombres}_${this.perfil.apellidos}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      window.open(url, '_blank'); // Fallback si falla el fetch
    }
  }
  // ==========================================
  // FOTO DE PERFIL
  // ==========================================

  getFotoUrl(): string {
    // 1. Si hay una previsualización local recién seleccionada
    if (this.fotoPreview) {
      return this.fotoPreview;
    }

    // 2. Si hay foto guardada en la base de datos
    if (this.perfil?.foto) {
      const foto = this.perfil.foto;

      // Si es una URL completa de internet o una cadena en Base64
      if (foto.startsWith('http') || foto.startsWith('data:')) {
        return foto;
      }

      // Aseguramos que la ruta tenga la barra '/' inicial para no formar 'http://localhost:3000uploads...'
      const rutaLimpia = foto.startsWith('/') ? foto : `/${foto}`;
      return `http://localhost:3000${rutaLimpia}`;
    }

    // 3. Imagen por defecto si no tiene foto cargada
    return 'assets/img/default-avatar.png';
  }

  // Manejador por si la imagen falla al cargar (404 o error de red)
  onFotoError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/default-avatar.png';
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccioná una imagen válida.');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB.');
      input.value = '';
      return;
    }

    this.archivoFotoSeleccionado = file;

    // Generamos la vista previa y SUBIMOS recién cuando termina de leer el archivo
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result as string;
      this.subirFotoPerfil(); // <-- Se ejecuta cuando la lectura finalizó
    };
    reader.readAsDataURL(file);
  }

  subirFotoPerfil(): void {
    if (!this.archivoFotoSeleccionado || !this.idPostulanteLogueado) return;

    this.postulanteService
      .subirFotoPerfil(this.idPostulanteLogueado, this.archivoFotoSeleccionado)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.perfil.foto = res.fotoUrl || res.data || '';
            this.archivoFotoSeleccionado = null;
            this.fotoPreview = null;
            alert('¡Foto de perfil actualizada!');
          } else {
            alert(res.message || 'No se pudo subir la foto.');
            this.fotoPreview = null;
          }
        },
        error: (err: any) => {
          console.error('Error al subir foto:', err);
          this.fotoPreview = null;
          alert(err?.error?.message || 'Ocurrió un error al subir la foto de perfil.');
        }
      });
  }

  // ==========================================
  // OBTENER Y GUARDAR PERFIL
  // ==========================================

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
      error: (err) => {
        console.error('Error al obtener perfil:', err);
      }
    });
  }

  guardarPerfilCompleto(): void {
    if (!this.idPostulanteLogueado) {
      alert('No se identificó la sesión del usuario.');
      return;
    }

    this.guardando = true;
    this.mensajeEstado = null;

    this.postulanteService
      .actualizarPerfil(this.idPostulanteLogueado, this.perfil)
      .subscribe({
        next: (res) => {
          this.guardando = false;
          if (res.success) {
            this.mensajeEstado = '¡Perfil guardado con éxito!';
            setTimeout(() => {
              this.mensajeEstado = null;
            }, 4000);
            this.obtenerDatosDelPostulante();
          } else {
            alert(res.message || 'No se pudieron guardar los cambios.');
          }
        },
        error: (err) => {
          this.guardando = false;
          console.error('Error al guardar perfil:', err);
          alert(err?.error?.message || 'Ocurrió un error al guardar los datos.');
        }
      });
  }

  // ==========================================
  // CATÁLOGO Y GESTIÓN DE SKILLS
  // ==========================================

  get categoriasFiltradas(): CategoriaSkillDTO[] {
    if (!this.busquedaSkill || !this.busquedaSkill.trim()) {
      return this.categoriasSkills;
    }

    const busqueda = this.busquedaSkill.toLowerCase().trim();

    return this.categoriasSkills
      .map(cat => ({
        ...cat,
        skills: cat.skills.filter(s => s.nombre.toLowerCase().includes(busqueda))
      }))
      .filter(cat => cat.skills.length > 0);
  }

  cargarCatalogoSkills(): void {
    this.postulanteService.getCatalogoSkills().subscribe({
      next: (res) => {
        if (res.success) {
          this.categoriasSkills = res.data;
        }
      },
      error: (err) => console.error('Error al cargar skills:', err)
    });
  }

  toggleSkill(skillId: number): void {
    const idx = this.tempSkillsIds.indexOf(skillId);
    if (idx > -1) {
      this.tempSkillsIds.splice(idx, 1);
    } else {
      this.tempSkillsIds.push(skillId);
    }
  }

  esSkillSeleccionada(skillId: number): boolean {
    return this.tempSkillsIds.includes(skillId);
  }

  // ==========================================
  // LÓGICA DE MODALES
  // ==========================================

  abrirModal(tipo: 'principales' | 'sobreMi' | 'skills' | 'redes'): void {
    this.modalActivo = tipo;

    switch (tipo) {
      case 'principales':
        this.tempUbicacion = {
          ciudad: this.perfil.ciudad,
          pais: this.perfil.pais
        };
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
    }
  }

  cerrarModal(): void {
    this.modalActivo = null;
  }

  // ==========================================
  // MÉTODOS DE GUARDADO DESDE MODALES
  // ==========================================

  guardarUbicacion(): void {
    this.perfil.ciudad = this.tempUbicacion.ciudad;
    this.perfil.pais = this.tempUbicacion.pais;
    this.guardarPerfilCompleto();
    this.cerrarModal();
  }

  guardarSobreMi(): void {
    this.perfil.sobre_mi = this.tempSobreMi.sobre_mi;
    this.perfil.especialidad = this.tempSobreMi.especialidad;
    this.perfil.estado_academico = this.tempSobreMi.estado_academico;
    this.guardarPerfilCompleto();
    this.cerrarModal();
  }

  // Renombrado a guardarSkills() para que coincida exactamente con el HTML
  guardarSkills(): void {
    const todasLasSkills: SkillDTO[] = [];
    this.categoriasSkills.forEach(cat => todasLasSkills.push(...cat.skills));

    this.perfil.skills = todasLasSkills.filter(s => this.tempSkillsIds.includes(s.skill_id));
    this.perfil.otras_habilidades = this.tempOtrasHabilidades;
    this.guardarPerfilCompleto();
    this.cerrarModal();
  }

  // Alias por si en algún lugar del HTML quedó escrito guardarSkillsModal()
  guardarSkillsModal(): void {
    this.guardarSkills();
  }

  guardarRedes(): void {
    this.perfil.redes = { ...this.tempRedes };
    this.guardarPerfilCompleto();
    this.cerrarModal();
  }
}