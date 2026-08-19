import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, EmpresaAdmin, MetricasAdmin, RespuestaApi } from '../../services/admin';

export type PestanaAdmin = 'empresas' | 'ofertas' | 'postulantes';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss'
})
export class PanelAdmin implements OnInit {
  private adminService = inject(AdminService);

 // 1. Control de Pestaña Activa
  pestanaActiva: PestanaAdmin = 'empresas';

  // 2. Estado Global y Métricas
  cargando: boolean = true;
  metricas: MetricasAdmin = { 
    totalOfertas: 0, 
    totalEmpresas: 0,
    totalPostulantes: 0, 
    totalPostulaciones: 0 
  };
  
  // 3. Arreglos Independientes (Fuertemente Tipados)
  empresas: EmpresaAdmin[] = [];
  ofertas: any[] = [];   // Se Tipará al crear la interfaz OfertaAdmin
  postulantes: any[] = [];   // Se Tipará al crear la interfaz AlumnoAdmin

  // 4. Modales
  empresaSeleccionada: EmpresaAdmin | null = null;
  mostrarModal: boolean = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cambiar de pestaña y cargar datos si están vacíos
  cambiarPestana(nuevaPestana: PestanaAdmin): void {
    this.pestanaActiva = nuevaPestana;
    
    if (nuevaPestana === 'ofertas' && this.ofertas.length === 0) {
      this.cargarOfertas();
    } else if (nuevaPestana === 'postulantes' && this.postulantes.length === 0) {
      this.cargarPostulantes();
    }
  }

  cargarDatos(): void {
    this.cargando = true;

    // Métricas Generales
    this.adminService.getMetricas().subscribe({
      next: (res: any) => {
        if (res && res.success && res.metricas) {
          this.metricas = res.metricas;
        }
      },
      error: (err) => console.error('Error al cargar métricas:', err)
    });

    // Lista de Empresas (Pestaña por defecto)
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

  // Métodos Stub para las nuevas entidades
  cargarOfertas(): void {
    // LLamada a adminService.getOfertas()
  }

  cargarPostulantes(): void {
    // LLamada a adminService.getPostulantes()
  }

  // Cambiar Estado (Empresas)
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

  // Modal
  verDetalle(empresa: EmpresaAdmin): void {
    this.empresaSeleccionada = empresa;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaSeleccionada = null;
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