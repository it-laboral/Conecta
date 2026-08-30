import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
export class EmpresaProfile implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api';

  perfil: PerfilEmpresaDTO = this.inicializarPerfil();
  perfilEditado: PerfilEmpresaDTO = this.inicializarPerfil();

  modoEdicion: boolean = false;
  cargando: boolean = true;
  guardando: boolean = false;
  logoPreview: string | null = null;
  archivoLogoSeleccionado: File | null = null;
  
  ngOnInit(): void {
    this.obtenerDatosEmpresa();
  }

  inicializarPerfil(): PerfilEmpresaDTO {
    return {
      // Datos fijos de empresa
      id_empresa: 0,
      razonSocial: '',
      fantasia: '',
      cuit: '',
      email: '',
      sector: '',
      ciudad_fiscal: '',
      provincia_fiscal: '',

      // Campos editables de perfil
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

    const user = this.authService.getUsuarioActual();
    if (!user || !user.id) {
      console.error('No se encontró información de usuario en sesión');
      queueMicrotask(() => {
        this.cargando = false;
        this.router.navigate(['/login']);
      });
      return;
    }

    const idEmpresa = user.id;

    this.http.get<any>(`${this.apiUrl}/empresa/perfil/${idEmpresa}`).subscribe({
      next: (res) => {
        queueMicrotask(() => {
          if (res.success && res.perfil) {
            this.perfil = { ...this.inicializarPerfil(), ...res.perfil };
            this.perfilEditado = structuredClone(this.perfil);

            // Si es el primer ingreso (sin perfil creado), entra directo en edición
            this.modoEdicion = !this.perfil.id_perfil;
          }
          this.cargando = false;
        });
      },
      error: (err) => {
        queueMicrotask(() => {
          console.error('Error al obtener perfil:', err);
          this.modoEdicion = true;
          this.cargando = false;
        });
      }
    });
  }

  activarEdicion(): void {
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
    this.logoPreview = null;
  }

  guardarCambios(): void {
    this.guardando = true;

    const user = this.authService.getUsuarioActual();
    if (!user || !user.id) {
      this.guardando = false;
      return;
    }

    // Payload que envía únicamente lo relativo a perfil_empresa
    const payload = {
      id_empresa: user.id,
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
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        alert('Ocurrió un error al intentar guardar los cambios.');
        this.guardando = false;
      }
    });
  }

  // 2. MÉTODOS DEL LOGO (Al final de la clase)
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea JPG o PNG
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        alert('Solo se admiten imágenes en formato JPG o PNG.');
        input.value = '';
        return;
      }

      this.archivoLogoSeleccionado = file;

      // Generar vista previa inmediata en el cliente
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Enviar el archivo inmediatamente al endpoint multipart/form-data
      this.subirLogoServidor(file);
    }
  }

  subirLogoServidor(file: File): void {
    const formData = new FormData();
    formData.append('logo', file);

    this.http.post<any>(`${this.apiUrl}/empresa/perfil/logo`, formData).subscribe({
      next: (res) => {
        if (res.success && res.logoUrl) {
          // Asigna la URL del servidor al objeto que enviará el PUT
          this.perfilEditado.logo = res.logoUrl;
        }
      },
      error: (err) => {
        console.error('Error al subir logo:', err);
        alert('No se pudo subir la imagen del logo al servidor.');
      }
    });
  }
}