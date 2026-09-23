import { 
  Component, 
  OnInit, 
  OnChanges, 
  SimpleChanges, 
  Input, 
  Output, 
  EventEmitter, 
  inject, 
  ChangeDetectorRef 
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

export interface PerfilEmpresaDTO {
  // Datos fijos / fiscales (Tabla 'empresa')
  id_empresa: number;
  razonSocial: string;
  fantasia?: string;
  cuit?: string;
  email: string;
  sector?: string;
  ciudad_fiscal?: string;
  provincia_fiscal?: string;

  // Datos operativos de perfil (Tabla 'perfil_empresa')
  id_perfil?: number;
  logo?: string;
  descripcion: string;
  trayectoria: string;
  stack_tecnologico?: string;
  beneficios?: string;
  modalidad?: 'Presencial' | 'Híbrido' | 'Remoto';
  zona_trabajo?: string;
  sitio_web?: string;
  linkedin?: string;
  telefono?: string;
  created_at?: string;
}

@Component({
  selector: 'app-empresa-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa-profile.html',
  styleUrl: './empresa-profile.scss',
})
export class EmpresaProfile implements OnInit, OnChanges {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://localhost:3000/api';
  readonly serverUrl = 'http://localhost:3000'; // 👈 Base para resolver rutas relativas de logos

  @Input() idEmpresaInput?: number | null = null;
  @Input() esModoAdmin: boolean = false;
  @Output() cerrarModal = new EventEmitter<void>();

  perfil: PerfilEmpresaDTO = this.inicializarPerfil();
  perfilEditado: PerfilEmpresaDTO = this.inicializarPerfil();

  esVisitante: boolean = false; // Indica si quien mira es Postulante/Admin
  modoEdicion: boolean = false;
  cargando: boolean = true;
  guardando: boolean = false;
  subiendoLogo: boolean = false;
  logoPreview: string | null = null;
  archivoLogoSeleccionado: File | null = null;

  ngOnInit(): void {
    this.obtenerDatosEmpresa();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEmpresaInput'] && !changes['idEmpresaInput'].isFirstChange()) {
      this.modoEdicion = false;
      this.obtenerDatosEmpresa();
    }
  }

  inicializarPerfil(): PerfilEmpresaDTO {
    return {
      id_empresa: 0,
      razonSocial: '',
      fantasia: '',
      cuit: '',
      email: '',
      sector: '',
      ciudad_fiscal: '',
      provincia_fiscal: '',
      id_perfil: undefined,
      logo: '',
      descripcion: '',
      trayectoria: '',
      stack_tecnologico: '',
      beneficios: '',
      modalidad: 'Híbrido',
      zona_trabajo: '',
      sitio_web: '',
      linkedin: '',
      telefono: ''
    };
  }

  obtenerDatosEmpresa(): void {
    this.cargando = true;

    const idParam = this.route.snapshot.paramMap.get('id');
    let idEmpresa: number;

    // Prioridad 1: Recibido por @Input() desde modal Admin/Postulante
    if (this.idEmpresaInput) {
      this.esVisitante = true;
      idEmpresa = Number(this.idEmpresaInput);
    } 
    // Prioridad 2: Recibido por parámetro de URL (/empresa/5)
    else if (idParam) {
      this.esVisitante = true;
      idEmpresa = Number(idParam);
    } 
    // Prioridad 3: Sesión activa de la propia empresa (/mi-perfil-empresa)
    else {
      this.esVisitante = false;
      const user = this.authService.getUsuarioActual();

      if (!user || (!user.id && !user.id_empresa)) {
        console.error('No se encontró información de usuario en sesión');
        this.cargando = false;
        this.router.navigate(['/sesion']);
        return;
      }

      idEmpresa = user.id || user.id_empresa;
    }

    this.http.get<any>(`${this.apiUrl}/empresa/perfil/${idEmpresa}`).subscribe({
      next: (res) => {
        if (res.success && res.perfil) {
          this.perfil = { ...this.inicializarPerfil(), ...res.perfil };
          
          // Formatear logo si el backend devuelve una ruta relativa (/uploads/...)
          if (this.perfil.logo && !this.perfil.logo.startsWith('http')) {
            this.perfil.logo = `${this.serverUrl}${this.perfil.logo.startsWith('/') ? '' : '/'}${this.perfil.logo}`;
          }

          this.perfilEditado = structuredClone(this.perfil);
          this.modoEdicion = this.esVisitante ? false : !this.perfil.id_perfil;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
        this.modoEdicion = !this.esVisitante;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    if (this.idEmpresaInput) {
      this.cerrarModal.emit();
    } else {
      this.location.back();
    }
  }

  activarEdicion(): void {
    if (this.esVisitante) return;
    this.perfilEditado = structuredClone(this.perfil);
    this.logoPreview = this.perfil.logo || null;
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    if (!this.perfil.id_perfil) {
      alert('Debes completar la información básica del perfil para continuar.');
      return;
    }
    this.modoEdicion = false;
    this.logoPreview = this.perfil.logo || null;
    this.archivoLogoSeleccionado = null;
    this.subiendoLogo = false;
  }

  guardarCambios(): void {
    if (this.esVisitante) return; // Guard de seguridad

    if (this.subiendoLogo) {
      alert('Por favor aguarda a que finalice la carga de la imagen del logo.');
      return;
    }
    this.guardando = true;

    const user = this.authService.getUsuarioActual();
    const idEmpresa = user?.id || user?.id_empresa;

    if (!idEmpresa) {
      this.guardando = false;
      return;
    }

    const payload = {
      id_empresa: idEmpresa,
      logo: this.perfilEditado.logo,
      descripcion: this.perfilEditado.descripcion,
      trayectoria: this.perfilEditado.trayectoria,
      stack_tecnologico: this.perfilEditado.stack_tecnologico,
      beneficios: this.perfilEditado.beneficios,
      modalidad: this.perfilEditado.modalidad,
      zona_trabajo: this.perfilEditado.zona_trabajo,
      sitio_web: this.perfilEditado.sitio_web,
      linkedin: this.perfilEditado.linkedin,
      telefono: this.perfilEditado.telefono
    };

    this.http.put<any>(`${this.apiUrl}/empresa/perfil`, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.perfil = structuredClone(this.perfilEditado);
          if (res.id_perfil) {
            this.perfil.id_perfil = res.id_perfil;
          }
          this.modoEdicion = false;
          alert('Perfil guardado con éxito.');
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        alert('Ocurrió un error al intentar guardar los cambios.');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  onLogoSelected(event: Event): void {
    if (this.esVisitante) return;

    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        alert('Solo se admiten imágenes en formato JPG o PNG.');
        input.value = '';
        return;
      }

      this.archivoLogoSeleccionado = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      this.subirLogoServidor(file);
    }
  }

  subirLogoServidor(file: File): void {
    if (this.esVisitante) return;
    this.subiendoLogo = true;

    const formData = new FormData();
    formData.append('logo', file);

    this.http.post<any>(`${this.apiUrl}/empresa/perfil/logo`, formData).subscribe({
      next: (res) => {
        if (res.success && res.logoUrl) {
          let url = res.logoUrl;
          if (!url.startsWith('http')) {
            url = `${this.serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
          }
          this.perfilEditado.logo = url;
        }
        this.subiendoLogo = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al subir logo:', err);
        alert('No se pudo subir la imagen del logo al servidor.');
        this.subiendoLogo = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 🛠️ Helpers útiles para usar en la plantilla HTML:

  /**
   * Convierte "Angular, Node.js, TypeScript" en un arreglo ["Angular", "Node.js", "TypeScript"]
   * Útil para renderizar badges en el HTML mediante *ngFor
   */
  get stackList(): string[] {
    if (!this.perfil.stack_tecnologico) return [];
    return this.perfil.stack_tecnologico
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Garantiza que los enlaces externos (web, linkedin) tengan el protocolo https://
   * evita que el navegador intente abrir la URL como una ruta interna de Angular.
   */
  obtenerUrlValida(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }
}