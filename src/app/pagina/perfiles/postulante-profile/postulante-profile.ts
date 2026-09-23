import { Component, OnInit, OnChanges, SimpleChanges, inject, PLATFORM_ID, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
export class PostulanteProfile implements OnInit, OnChanges {

  // SERVICIOS
  private postulanteService = inject(PostulanteService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  // 1. RECEPTOR DE ID DESDE PANEL-ADMIN O PADRE
  @Input() idPostulanteInput?: number;
  @Input() esModoAdmin: boolean = false;

  // BANDERAS DE NAVEGACIÓN Y PERMISOS
  esVisitante: boolean = false;
  idPostulanteAObtener: number = 0;

  // DATOS DEL USUARIO
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
    this.evaluarYcargarDatos();
  }

  // Detecta cambios si el admin selecciona a otro postulante de la lista
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idPostulanteInput'] && !changes['idPostulanteInput'].firstChange) {
      const nuevoId = changes['idPostulanteInput'].currentValue;
      if (nuevoId) {
        this.esVisitante = true;
        this.idPostulanteAObtener = Number(nuevoId);
        this.obtenerDatosDelPostulante();
        this.cargarCatalogoSkills();
      }
    }
  }

  private evaluarYcargarDatos(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (this.idPostulanteInput) {
      // Viene como componente hijo en Panel Admin o Modal
      this.esVisitante = true;
      this.idPostulanteAObtener = Number(this.idPostulanteInput);
    } else if (idParam) {
      // Viene por URL directa (/postulante/:id)
      this.esVisitante = true;
      this.idPostulanteAObtener = Number(idParam);
    } else {
      // El propio alumno ingresando a su perfil (/perfil/postulante)
      this.esVisitante = false;
      this.idPostulanteAObtener = this.obtenerIdDeSesion();
    }

    if (this.idPostulanteAObtener) {
      this.obtenerDatosDelPostulante();
      this.cargarCatalogoSkills();
    }
  }

  private obtenerIdDeSesion(): number {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSesion = localStorage.getItem('usuario');
      if (usuarioSesion) {
        try {
          const userObj = JSON.parse(usuarioSesion);
          return userObj.id_postulante || userObj.id || 1;
        } catch (error) {
          console.error('Error al leer usuario de localStorage:', error);
        }
      }
    }
    return 1;
  }

  volver(): void {
    this.location.back();
  }

  // ==========================================
  // GESTIÓN DE CURRICULUM VITAE
  // ==========================================

  private obtenerUrlCV(): string | null {
    if (!this.perfil?.cv_url) return null;
    const backendUrl = 'http://localhost:3000';
    return this.perfil.cv_url.startsWith('http')
      ? this.perfil.cv_url
      : `${backendUrl}${this.perfil.cv_url}`;
  }

  irACurriculum(): void {
    if (this.esVisitante) return;
    this.router.navigate(['/perfil/curriculum']);
  }

  verCV(): void {
    const rawUrl = this.obtenerUrlCV();

    if (rawUrl) {
      this.cvPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      this.mostrarVistaPreviaCV = true;
      this.cdr.detectChanges();
    } else {
      this.irACurriculum();
    }
  }

  cerrarVistaPreviaCV(): void {
    this.mostrarVistaPreviaCV = false;
    this.cvPreviewUrl = null;
  }

  async descargarCV(): Promise<void> {
    const url = this.obtenerUrlCV();

    if (!url) {
      this.irACurriculum();
      return;
    }

    try {
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
      window.open(url, '_blank');
    }
  }

  // ==========================================
  // FOTO DE PERFIL
  // ==========================================

  getFotoUrl(): string {
    if (this.fotoPreview) {
      return this.fotoPreview;
    }

    if (this.perfil?.foto) {
      const foto = this.perfil.foto;

      if (foto.startsWith('http') || foto.startsWith('data:')) {
        return foto;
      }

      const rutaLimpia = foto.startsWith('/') ? foto : `/${foto}`;
      return `http://localhost:3000${rutaLimpia}`;
    }

    return 'assets/img/default-avatar.png';
  }

  onFotoError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/default-avatar.png';
  }

  onFotoSeleccionada(event: Event): void {
    if (this.esVisitante) return;

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

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result as string;
      this.subirFotoPerfil();
    };
    reader.readAsDataURL(file);
  }

  subirFotoPerfil(): void {
    if (!this.archivoFotoSeleccionado || !this.idPostulanteAObtener) return;

    this.postulanteService
      .subirFotoPerfil(this.idPostulanteAObtener, this.archivoFotoSeleccionado)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.perfil.foto = res.fotoUrl || res.data || '';
            this.archivoFotoSeleccionado = null;
            this.fotoPreview = null;
            alert('¡Foto de perfil actualizada!');
            this.cdr.detectChanges();
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
    if (!this.idPostulanteAObtener) return;

    this.postulanteService.getPerfil(this.idPostulanteAObtener).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.perfil = {
            ...inicializarPerfilPostulante(),
            ...res.data,
            skills: res.data.skills || [],
            redes: res.data.redes || { github: '', linkedin: '', portfolio: '' }
          };
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
        this.cdr.detectChanges();
      }
    });
  }

  guardarPerfilCompleto(): void {
    if (!this.idPostulanteAObtener) {
      alert('No se identificó la sesión del usuario.');
      return;
    }

    this.guardando = true;
    this.mensajeEstado = null;

    this.postulanteService
      .actualizarPerfil(this.idPostulanteAObtener, this.perfil)
      .subscribe({
        next: (res) => {
          this.guardando = false;
          if (res.success) {
            this.mensajeEstado = '¡Perfil guardado con éxito!';
            setTimeout(() => {
              this.mensajeEstado = null;
              this.cdr.detectChanges();
            }, 4000);
            this.obtenerDatosDelPostulante();
          } else {
            alert(res.message || 'No se pudieron guardar los cambios.');
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.guardando = false;
          console.error('Error al guardar perfil:', err);
          alert(err?.error?.message || 'Ocurrió un error al guardar los datos.');
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
    if (this.esVisitante) return;

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

  guardarSkills(): void {
    const todasLasSkills: SkillDTO[] = [];
    this.categoriasSkills.forEach(cat => todasLasSkills.push(...cat.skills));

    this.perfil.skills = todasLasSkills.filter(s => this.tempSkillsIds.includes(s.skill_id));
    this.perfil.otras_habilidades = this.tempOtrasHabilidades;
    this.guardarPerfilCompleto();
    this.cerrarModal();
  }

  guardarSkillsModal(): void {
    this.guardarSkills();
  }

  guardarRedes(): void {
    this.perfil.redes = { ...this.tempRedes };
    this.guardarPerfilCompleto();
    this.cerrarModal();
  }
}