import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Skills } from './skills/skills';
import { PostulanteProfile } from '../perfiles/postulante-profile/postulante-profile';
import { EmpresaProfile } from '../perfiles/empresa-profile/empresa-profile';
import { PostulacionesComponent } from '../postulaciones/postulaciones';
import { ReportesAdminComponent } from './reportes/reportes';
import { 
  AdminService, 
  EmpresaAdmin, 
  OfertaAdmin,
  PostulanteAdmin,
  MetricasAdmin, 
  RespuestaApi 
} from '../../services/admin';

export type PestanaAdmin = 'empresas' | 'ofertas' | 'postulantes' | 'postulaciones' | 'reportes' | 'skills';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, Skills, PostulanteProfile, EmpresaProfile, PostulacionesComponent, ReportesAdminComponent],
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

  // Control de Cargas Únicas
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
  
  // 🟢 ALERTAS Y PENDIENTES
  pendientesEmpresas: number = 0;
  pendientesPostulantes: number = 0;
  totalPendientes: number = 0;

  // Arreglos de Datos
  empresas: EmpresaAdmin[] = [];
  ofertas: OfertaAdmin[] = [];
  postulantes: PostulanteAdmin[] = [];

  // Modales Empresas
  empresaSeleccionada: EmpresaAdmin | null = null;
  mostrarModal: boolean = false;
  empresaPerfilId: number | null = null;

  // Modales Postulantes
  postulanteSeleccionado: PostulanteAdmin | null = null;
  mostrarModalPostulante: boolean = false;
  
  ngOnInit(): void {
    // 🟢 Usamos setTimeout para posponer la actualización de métricas al siguiente tick del event loop
  setTimeout(() => {
    this.cargarDatos();
  }, 0);
}

  toggleSkills(): void {
    this.mostrarSkills = !this.mostrarSkills;
  }

  irASkills(): void {
    this.mostrarSkills = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const seccion = document.getElementById('seccion-skills');
      if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  // Cambiar de pestaña
  cambiarPestana(nuevaPestana: PestanaAdmin): void {
    this.mostrarSkills = false;
    this.pestanaActiva = nuevaPestana;
    
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
    this.cargarPendientes(); // 👈 Carga el número de alertas rojas al iniciar
    this.cargarEmpresas();
  }

  // 🟢 Consultar alertas de usuarios pendientes
  cargarPendientes(): void {
    this.adminService.getPendientesCount().subscribe({
      next: (res) => {
        if (res && res.success) {
          this.pendientesEmpresas = res.totalEmpresas || 0;
          this.pendientesPostulantes = res.totalPostulantes || 0;
          this.totalPendientes = res.totalPendientes || 0;
         // Forza la actualización correcta sin romper el ciclo
        this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Error al consultar solicitudes pendientes:', err)
    });
  }

  // Métricas Generales
  cargarMetricas(): void {
    this.adminService.getMetricas().subscribe({
      next: (metricas: MetricasAdmin) => {
        if (metricas) {
          this.metricas = metricas;
        }
      },
      error: (err) => console.error('Error al cargar métricas:', err)
    });
  }

  // Carga de Empresas
  cargarEmpresas(): void {
    this.cargando = true;
    this.adminService.getEmpresas().subscribe({
      next: (empresas: EmpresaAdmin[]) => {
        this.empresas = empresas || [];
        this.cargadoEmpresas = true;
        this.cargando = false;
        this.cdr.detectChanges();
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
      next: (ofertas: OfertaAdmin[]) => {
        this.ofertas = ofertas || [];
        this.cargadoOfertas = true;
        this.cargando = false;
        this.cdr.detectChanges();
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
      next: (postulantes: PostulanteAdmin[]) => {
        this.postulantes = postulantes || [];
        this.cargadoPostulantes = true;
        this.cargando = false;
        this.cdr.detectChanges();
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
            this.cdr.detectChanges();
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

  // ==========================================
  // GESTIÓN DE ESTADOS: EMPRESAS
  // ==========================================

  cambiarEstado(idEmpresa: number, estadoActual: string): void {
    const estadoLimpio = (estadoActual || '').trim().toLowerCase();
    const nuevoEstado = estadoLimpio === 'activo' ? 'Inactivo' : 'Activo';

    this.adminService.cambiarEstadoEmpresa(idEmpresa, nuevoEstado).subscribe({
      next: (res: RespuestaApi) => {
        if (res.success) {
          const emp = this.empresas.find(e => e.id_empresa === idEmpresa);
          if (emp) emp.estado = nuevoEstado;

          if (this.empresaSeleccionada && this.empresaSeleccionada.id_empresa === idEmpresa) {
            this.empresaSeleccionada.estado = nuevoEstado;
          }

          this.cargarPendientes(); // 👈 Actualiza el badge
          this.cdr.detectChanges();
        } else {
          alert(res.mensaje || 'No se pudo cambiar el estado de la empresa.');
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Ocurrió un error al comunicarse con el servidor.');
      }
    });
  }

  aprobarEmpresa(idEmpresa: number): void {
    this.adminService.cambiarEstadoEmpresa(idEmpresa, 'Activo').subscribe({
      next: (res: RespuestaApi) => {
        if (res.success) {
          const emp = this.empresas.find(e => e.id_empresa === idEmpresa);
          if (emp) emp.estado = 'Activo';
          this.cargarPendientes(); // 👈 Descuenta de la alerta roja
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al aprobar empresa:', err)
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

  abrirPerfilEmpresa(idEmpresa: number): void {
    this.empresaPerfilId = idEmpresa;
  }

  cerrarModalPerfil(): void {
    this.empresaPerfilId = null;
  }

  // ==========================================
  // GESTIÓN DE ESTADOS: POSTULANTES
  // ==========================================

  cambiarEstadoPostulante(idPostulante: number, estadoActual: string): void {
    const estadoLimpio = (estadoActual || '').trim().toLowerCase();
    const nuevoEstado = estadoLimpio === 'activo' ? 'Inactivo' : 'Activo';

    this.adminService.cambiarEstadoPostulante(idPostulante, nuevoEstado).subscribe({
      next: (res: RespuestaApi) => {
        if (res.success) {
          const post = this.postulantes.find(p => (p.id_postulante || p.id) === idPostulante);
          if (post) post.estado = nuevoEstado;

          if (this.postulanteSeleccionado && (this.postulanteSeleccionado.id_postulante || this.postulanteSeleccionado.id) === idPostulante) {
            this.postulanteSeleccionado.estado = nuevoEstado;
          }

          this.cargarPendientes(); // 👈 Actualiza el badge
          this.cdr.detectChanges();
        } else {
          alert(res.mensaje || 'No se pudo cambiar el estado del postulante.');
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado del postulante:', err);
        alert('Ocurrió un error al comunicarse con el servidor.');
      }
    });
  }

  aprobarPostulante(idPostulante: number): void {
    this.adminService.cambiarEstadoPostulante(idPostulante, 'Activo').subscribe({
      next: (res: RespuestaApi) => {
        if (res.success) {
          const post = this.postulantes.find(p => (p.id_postulante || p.id) === idPostulante);
          if (post) post.estado = 'Activo';
          this.cargarPendientes(); // 👈 Descuenta de la alerta roja
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al aprobar postulante:', err)
    });
  }

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
    localStorage.clear();
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