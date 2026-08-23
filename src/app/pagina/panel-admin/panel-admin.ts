import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Skills} from './skills/skills';
import { 
  AdminService, 
  EmpresaAdmin, 
  OfertaAdmin,
  PostulanteAdmin,
  MetricasAdmin, 
  RespuestaApi 
} from '../../services/admin';
   

export type PestanaAdmin = 'empresas' | 'ofertas' | 'postulantes'| 'skills';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Skills],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss'
})
export class PanelAdmin implements OnInit {
  private adminService = inject(AdminService);

  // Control de Skills
  mostrarSkills: boolean = false;

  // 1. Control de Pestaña Activa
  pestanaActiva: PestanaAdmin = 'empresas';

  cargadoEmpresas: boolean = false;
  cargadoOfertas: boolean = false;
  cargadoPostulantes: boolean = false;

  // 2. Estado Global y Métricas
  cargando: boolean = false;
  metricas: MetricasAdmin = { 
    totalOfertas: 0, 
    totalEmpresas: 0,
    totalPostulantes: 0, 
    totalPostulaciones: 0 
  };
  
  // 3. Arreglos Independientes
  empresas: EmpresaAdmin[] = [];
  ofertas: OfertaAdmin[] = [];
  postulantes: PostulanteAdmin[] = [];

  // 4. Modales
  empresaSeleccionada: EmpresaAdmin | null = null;
  mostrarModal: boolean = false;

  postulanteSeleccionado: PostulanteAdmin | null = null;
  mostrarModalPostulante: boolean = false;
  
  ngOnInit(): void {
    this.cargarDatos();
  }
  toggleSkills(): void {
    this.mostrarSkills = !this.mostrarSkills;
  }

  // Cambiar de pestaña y cargar datos si están vacíos
  cambiarPestana(nuevaPestana: PestanaAdmin): void {
    this.mostrarSkills = false; // Cerramos skills si cambia de pestaña
    this.pestanaActiva = nuevaPestana;
    
    if (nuevaPestana === 'empresas' && this.empresas.length === 0) {
      this.cargarEmpresas();
    } else if (nuevaPestana === 'ofertas' && this.ofertas.length === 0) {
      this.cargarOfertas();
    } else if (nuevaPestana === 'postulantes' && this.postulantes.length === 0) {
      this.cargarPostulantes();
    }
  }

  cargarDatos(): void {
    this.cargarMetricas();
    this.cargarEmpresas();
  }
    // Métricas Generales
    cargarMetricas(): void{
    this.adminService.getMetricas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.metricas) {
          this.metricas = res.metricas;
        }
      },
      error: (err) => console.error('Error al cargar métricas:', err)
    });
  }
    // Lista de Empresas (Pestaña por defecto)
  cargarEmpresas(): void {
    this.cargando = true;
    this.adminService.getEmpresas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.empresas) {
          this.empresas = res.empresas;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.cargando = false;
      }
    });
  }

  cargarOfertas(): void {
    this.cargando = true;
    this.adminService.getOfertas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.ofertas) {
          this.ofertas = res.ofertas;
        } else if (Array.isArray(res)) {
          this.ofertas = res;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ofertas en el admin:', err);
        this.cargando = false;
      }
    });
  }

  cargarPostulantes(): void {
    this.cargando = true;
    this.adminService.getPostulantes().subscribe({
      next: (res: any) => {
        if (res && res.success && res.postulantes) {
          this.postulantes = res.postulantes;
        } else if (Array.isArray(res)) {
          this.postulantes = res;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar postulantes en el admin:', err);
        this.cargando = false;
      }
    });
  }
  
  // ACCIÓN DE MODERACIÓN DE OFERTAS
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

  // FUNCIONES AUXILIARES DE FECHAS Y ESTADOS DE OFERTAS
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

  // ACCIONES Y MODALES (EMPRESAS)
  cambiarEstado(idEmpresa: number, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    
    this.adminService.cambiarEstadoEmpresa(idEmpresa, nuevoEstado).subscribe({
      next: (res: RespuestaApi) => {
        if (res.success) {
          const emp = this.empresas.find(e => e.id_empresa === idEmpresa);
          if (emp) emp.estado = nuevoEstado;

          if (this.empresaSeleccionada && this.empresaSeleccionada.id_empresa === idEmpresa) {
            this.empresaSeleccionada.estado = nuevoEstado;
          }
        }
      },
      error: (err) => console.error('Error al cambiar estado:', err)
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

  // ACCIONES Y MODALES (POSTULANTES)
  verDetallePostulante(postulante: PostulanteAdmin): void {
    this.postulanteSeleccionado = postulante;
    this.mostrarModalPostulante = true;
  }

  cerrarModalPostulante(): void {
    this.mostrarModalPostulante = false;
    this.postulanteSeleccionado = null;
  }

  // Helpers para KeyValuePipe
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