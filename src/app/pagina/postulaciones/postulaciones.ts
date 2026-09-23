import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EstadoPostulacion, Postulacion, PostulacionesService } from '../../services/postulaciones.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './postulaciones.html',
  styleUrl: './postulaciones.scss'
})
export class PostulacionesComponent implements OnInit {
  // --- Inyección de Servicios ---
  private postulacionesService = inject(PostulacionesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- Estado del Componente ---
  postulaciones: Postulacion[] = [];
  rolUsuario: string = ''; 
  cargando: boolean = true;
  idOfertaFiltro: number | null = null;

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioActual(); 
    this.rolUsuario = (usuario?.rol || this.authService.getTipoUsuario() || 'postulante').toLowerCase();

    // Escucha de parámetros en URL con limpieza automática de memoria
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.idOfertaFiltro = params['oferta'] ? Number(params['oferta']) : null;
        this.cargarPostulaciones(usuario);
      });
  }

  // --- Carga de Datos según Rol ---
  cargarPostulaciones(usuario: any): void {
    if (!usuario) {
      this.cargando = false;
      return;
    }

    this.cargando = true;

    const handleSuccess = (data: Postulacion[]) => this.setDatos(data);
    const handleError = (err: unknown) => {
      console.error('Error al cargar postulaciones:', err);
      this.cargando = false;
      this.cdr.detectChanges();
    };

    switch (this.rolUsuario) {
      case 'postulante': {
        const idPostulante = usuario.id_postulante || usuario.id;
        this.postulacionesService.getByPostulante(idPostulante).subscribe({
          next: handleSuccess,
          error: handleError
        });
        break;
      }
      case 'empresa': {
        if (this.idOfertaFiltro) {
          this.postulacionesService.getByOferta(this.idOfertaFiltro).subscribe({
            next: handleSuccess,
            error: handleError
          });
        } else {
          const idEmpresa = usuario.id_empresa || usuario.id;
          this.postulacionesService.getByEmpresa(idEmpresa).subscribe({
            next: handleSuccess,
            error: handleError
          });
        }
        break;
      }
      case 'admin': {
        this.postulacionesService.getTodas().subscribe({
          next: handleSuccess,
          error: handleError
        });
        break;
      }
      default: {
        this.cargando = false;
        break;
      }
    }
  }

  // --- Acciones ---
  actualizarEstado(id_postulacion: number | undefined, event: Event): void {
    if (!id_postulacion) return;
      
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstado = selectElement.value as EstadoPostulacion;

    this.postulacionesService.actualizarEstado(id_postulacion, nuevoEstado).subscribe({
      next: () => {
        const item = this.postulaciones.find(p => this.obtenerId(p) === id_postulacion);
        if (item) {
          item.estado = nuevoEstado;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al actualizar el estado:', err)
    });
  }

  cancelarPostulacion(id_postulacion: number | undefined): void {
    if (!id_postulacion) return;
    if (!confirm('¿Estás seguro de que deseas retirar tu postulación a esta oferta?')) return;

    this.postulacionesService.cancelarPostulacion(id_postulacion).subscribe({
      next: () => {
        this.postulaciones = this.postulaciones.filter(p => this.obtenerId(p) !== id_postulacion);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cancelar postulación:', err)
    });
  }

  eliminarPorModeracion(id_postulacion: number | undefined): void {
    if (!id_postulacion) return;
    if (!confirm('¿Eliminar esta postulación del registro del sistema?')) return;

    this.postulacionesService.eliminarPorModeracion(id_postulacion).subscribe({
      next: () => {
        this.postulaciones = this.postulaciones.filter(p => this.obtenerId(p) !== id_postulacion);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al eliminar postulación:', err)
    });
  }

  verPerfilPostulante(idPostulante?: number): void {
    if (idPostulante) {
      this.router.navigate(['/postulante', idPostulante]);
    }
  }

  // --- Métodos Auxiliares ---
  
  /**
   * Obtiene el ID soportando tanto snake_case como camelCase de la API
   */
  obtenerId(item: Postulacion): number | undefined {
    return item.id_postulacion ?? (item as any).idPostulacion;
  }

  obtenerClaseBadge(estado?: string): string {
    switch (estado) {
      case 'Aceptado': return 'badge-success';
      case 'Rechazado': return 'badge-danger';
      case 'En Revision': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  private setDatos(data: Postulacion[]): void {
    this.postulaciones = (data || []).map(item => ({
      ...item,
      estado: item.estado || 'Pendiente'
    }));
    this.cargando = false;
    this.cdr.detectChanges();
  }
}