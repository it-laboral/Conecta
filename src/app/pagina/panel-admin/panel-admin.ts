import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Skills } from './skills/skills';
import {PostulanteProfile} from '../perfiles/postulante-profile/postulante-profile';
import {EmpresaProfile  } from '../perfiles/empresa-profile/empresa-profile';
import { PostulacionesComponent } from '../postulaciones/postulaciones';
import { 
  AdminService, 
  EmpresaAdmin, 
  OfertaAdmin,
  PostulanteAdmin,
  MetricasAdmin, 
  RespuestaApi 
} from '../../services/admin';

export type PestanaAdmin = 'empresas' | 'ofertas' | 'postulantes' | 'postulaciones' | 'skills';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, Skills, PostulanteProfile, EmpresaProfile, PostulacionesComponent],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss'
})
export class PanelAdmin implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  public authService = inject(AuthService);

  // Control de Vistas
  mostrarSkills: boolean = false;
  pestanaActiva: PestanaAdmin = 'empresas';

  // Control de Cargas Únicas (Evita re-peticiones a la API)
  cargadoEmpresas: boolean = false;
  cargadoOfertas: boolean = false;
  cargadoPostulantes: boolean = false;

  // Estado Global y Métricas
  cargando: boolean = false;
  metricas: MetricasAdmin = { 
    totalOfertas: 0, 
    totalEmpresas: 0,
    totalPostulantes: 0, 
    totalPostulaciones: 0 
  };
  
  // Arreglos de Datos
  empresas: EmpresaAdmin[] = [];
  ofertas: OfertaAdmin[] = [];
  postulantes: PostulanteAdmin[] = [];

  // Modales
  empresaSeleccionada: EmpresaAdmin | null = null;
  mostrarModal: boolean = false;
// 👈 Modal Perfil de Empresa (EmpresaProfile)
  empresaPerfilId: number | null = null;

  postulanteSeleccionado: PostulanteAdmin | null = null;
  mostrarModalPostulante: boolean = false;
  
  ngOnInit(): void {
    this.cargarDatos();
  }

  toggleSkills(): void {
    this.mostrarSkills = !this.mostrarSkills;
  }

  // Cambiar de pestaña
  cambiarPestana(nuevaPestana: PestanaAdmin): void {
    this.mostrarSkills = false;
    this.pestanaActiva = nuevaPestana;
    
    // Carga perezosa (Lazy loading): solo pide los datos la primera vez que se entra a la pestaña
    if (nuevaPestana === 'empresas' && !this.cargadoEmpresas) {
      this.cargarEmpresas();
    } else if (nuevaPestana === 'ofertas' && !this.cargadoOfertas) {
      this.cargarOfertas();
    } else if (nuevaPestana === 'postulantes' && !this.cargadoPostulantes) {
      this.cargarPostulantes();
    }
  }

  cargarDatos(): void {
    this.cargarMetricas();
    this.cargarEmpresas();
  }

  // Métricas Generales
  cargarMetricas(): void {
    this.adminService.getMetricas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.metricas) {
          this.metricas = res.metricas;
        }
      },
      error: (err) => console.error('Error al cargar métricas:', err)
    });
  }

  // Carga de Empresas
  cargarEmpresas(): void {
    this.cargando = true;
    this.adminService.getEmpresas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.empresas) {
          this.empresas = res.empresas;
        }
        this.cargadoEmpresas = true;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.cargadoEmpresas = true;
        this.cargando = false;
      }
    });
  }

  // Carga de Ofertas
  cargarOfertas(): void {
    this.cargando = true;
    this.adminService.getOfertas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.ofertas) {
          this.ofertas = res.ofertas;
        } else if (Array.isArray(res)) {
          this.ofertas = res;
        }
        this.cargadoOfertas = true;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ofertas en el admin:', err);
        this.cargadoOfertas = true;
        this.cargando = false;
      }
    });
  }

  // Carga de Postulantes
  cargarPostulantes(): void {
    this.cargando = true;
    this.adminService.getPostulantes().subscribe({
      next: (res: any) => {
        if (res && res.success && res.postulantes) {
          this.postulantes = res.postulantes;
        } else if (Array.isArray(res)) {
          this.postulantes = res;
        }
        this.cargadoPostulantes = true;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar postulantes en el admin:', err);
        this.cargadoPostulantes = true;
        this.cargando = false;
      }
    });
  }

  // Moderación de Ofertas
  bajaOfertaAdmin(idOferta: number): void {
    if (confirm(`¿Está seguro de que desea eliminar la oferta #${idOferta} de manera permanente?`)) {
      this.adminService.eliminarOferta(idOferta).subscribe({
        next: (res: RespuestaApi) => {
          if (res.success) {
            alert(`Oferta #${idOferta} eliminada con éxito.`);
            this.ofertas = this.ofertas.filter(o => o.id_oferta !== idOferta);
          }
        },
        error: (err) => console.error('Error al eliminar oferta:', err)
      });
    }
  }

  // Helpers de Fechas
  formatearFecha(fechaRaw: string | Date | null | undefined): string {
    if (!fechaRaw) return 'Sin fecha';
    const fecha = new Date(fechaRaw);
    if (isNaN(fecha.getTime())) return 'Sin fecha';

    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerEstadoYConteo(fechaPub: string | Date | null | undefined, diasDuracion: number = 10) {
    if (!fechaPub) return { estadoText: 'Sin Fecha', dias: 0, finalizada: true };

    const inicio = new Date(fechaPub);
    if (isNaN(inicio.getTime())) return { estadoText: 'Sin Fecha', dias: 0, finalizada: true };

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + Number(diasDuracion));

    const hoy = new Date();
    const diferenciaMs = fin.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 0) {
      return { estadoText: 'Finalizada', dias: 0, finalizada: true };
    }

    return { 
      estadoText: 'Vigente', 
      dias: diasRestantes, 
      finalizada: false 
    };
  }

// Modales y Acciones (Empresas)
cambiarEstado(idEmpresa: number, estadoActual: string): void {
  // 1. Normalizamos la cadena a minúsculas y sin espacios para evitar fallos de formato
  const esActivo = estadoActual?.toString().trim().toLowerCase() === 'activo';
  const nuevoEstado = esActivo ? 'Inactivo' : 'Activo';

  this.adminService.cambiarEstadoEmpresa(idEmpresa, nuevoEstado).subscribe({
    next: (res: RespuestaApi) => {
      if (res.success) {
        // 2. Actualizar objeto en la lista principal de empresas
        const emp = this.empresas.find(e => e.id_empresa === idEmpresa);
        if (emp) {
          emp.estado = nuevoEstado;
        }

        // 3. Actualizar objeto si está seleccionado en un modal de detalle
        if (this.empresaSeleccionada && this.empresaSeleccionada.id_empresa === idEmpresa) {
          this.empresaSeleccionada.estado = nuevoEstado;
        }

        // 4. Forzar la actualización visual de la tabla y los botones
        this.cdr.detectChanges();
      } else {
        // Si el backend devolvió success: false, mostramos el mensaje
        alert(res.mensaje || 'No se pudo cambiar el estado de la empresa.');
      }
    },
    error: (err) => {
      console.error('Error al cambiar estado:', err);
      alert('Ocurrió un error al comunicarse con el servidor.');
    }
  });
}
  verDetalle(empresa: EmpresaAdmin): void {
    this.empresaSeleccionada = empresa;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaSeleccionada = null;
  }
// 👈  MODAL 2 PERFIL COMPLETO (EmpresaProfile)
  abrirPerfilEmpresa(idEmpresa: number): void {
    this.empresaPerfilId = idEmpresa;
  }

  cerrarModalPerfil(): void {
  this.empresaPerfilId = null;
}

  // Modales y Acciones (Postulantes)
  verDetallePostulante(postulante: PostulanteAdmin): void {
    this.postulanteSeleccionado = postulante;
    this.mostrarModalPostulante = true;
  }

  cerrarModalPostulante(): void {
    this.mostrarModalPostulante = false;
    this.postulanteSeleccionado = null;
  }

  // Cierre de Sesión Centralizado
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/sesion']);
  }
  
  // KeyValuePipe Helpers
  normalizarClave(clave: string | number | symbol): string {
    return clave.toString();
  }

  esCampoVisible(clave: string | number | symbol): boolean {
    const valor = this.normalizarClave(clave).toLowerCase();
    const camposOcultos = ['password', 'contrasena', 'clave', 'pass', 'token'];
    return !camposOcultos.includes(valor);
  }

  formatearClave(clave: string | number | symbol): string {
    return this.normalizarClave(clave).replace(/_/g, ' ').toUpperCase();
  }
}