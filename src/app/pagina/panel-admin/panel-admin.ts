import {Component, OnInit, inject} from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { AdminService} from '../../services/admin';


@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [KeyValuePipe],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss'
})

export class PanelAdmin implements OnInit {
  private adminService = inject(AdminService);

  metricas = { totalOfertas: 0, totalEmpresas: 0, totalPostulantes: 0, totalPostulaciones: 0 };
  empresas: any[] = [];
  cargando: boolean = true;

  // Estado del Modal
  empresaSeleccionada: any = null;
  mostrarModal: boolean = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Obtener Métricas Generales
    this.adminService.getMetricas().subscribe({
      next: (res) => {
        if (res.success) this.metricas = res.metricas;
      },
      error: (err) => console.error('Error al cargar métricas:', err)
    });

    // Obtener Lista de Empresas
    this.adminService.getEmpresas().subscribe({
      next: (res) => {
        if (res.success) this.empresas = res.empresas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.cargando = false;
      }
    });
  }
// Abrir y Cerrar Modal
  verDetalle(empresa: any): void {
    this.empresaSeleccionada = empresa;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaSeleccionada = null;
  }

  normalizarClave(clave: string | number | symbol): string {
    return clave.toString();
  }

  // 🔹 Filtro de campos sensibles
  esCampoVisible(clave: string | number | symbol): boolean {
    const valor = this.normalizarClave(clave).toLowerCase();
    const camposOcultos = ['password', 'contrasena', 'clave', 'pass', 'token'];
    return !camposOcultos.includes(valor);
  }

  // 🔹 Formateador para etiquetas bonitas (ej: "contacto_nombre" -> "CONTACTO NOMBRE")
  formatearClave(clave: string | number | symbol): string {
    return this.normalizarClave(clave).replace(/_/g, ' ').toUpperCase();
  }

  cambiarEstado(idEmpresa: number, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    
    this.adminService.cambiarEstadoEmpresa(idEmpresa, nuevoEstado).subscribe({
      next: (res) => {
        if (res.success) {
          this.cargarDatos(); // Recargar datos de la tabla
        }
      },
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }
}

