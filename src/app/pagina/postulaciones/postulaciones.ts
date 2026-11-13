import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 1. Importar FormsModule para el [(ngModel)]
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EstadoPostulacion, Postulacion, PostulacionesService } from '../../services/postulaciones.service';
import { AuthService } from '../../services/auth.service';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-postulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 2. Agregarlo a los imports del componente
  templateUrl: './postulaciones.html',
  styleUrl: './postulaciones.scss'
})
export class PostulacionesComponent implements OnInit {
  // --- Inyección de Servicios ---
  private postulacionesService = inject(PostulacionesService);
  private authService = inject(AuthService);
  private alertaService = inject(AlertaService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- Estado del Componente ---
  postulaciones: Postulacion[] = [];
  rolUsuario: string = ''; 
  cargando: boolean = true;
  idOfertaFiltro: number | null = null;
  
  // 🔍 3. Propiedad para el texto de búsqueda
  searchQuery: string = '';

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

  // 🔍 4. Getter computado para filtrar el listado en tiempo real sin tocar el backend
  get postulacionesFiltradas(): Postulacion[] {
    if (!this.searchQuery.trim()) {
      return this.postulaciones;
    }
    const query = this.searchQuery.toLowerCase();
    return this.postulaciones.filter(p => {
      // Ajustá estas propiedades según cómo te devuelva los datos tu API (ej: titulo_oferta, nombre_postulante, razon_social, etc.)
      const tituloOferta = (p as any).titulo_oferta || (p as any).ofertaTitulo || '';
      const nombrePostulante = (p as any).nombre_postulante || (p as any).postulanteNombre || '';
      const razonSocial = (p as any).razon_social || (p as any).empresa || '';

      return (
        tituloOferta.toLowerCase().includes(query) ||
        nombrePostulante.toLowerCase().includes(query) ||
        razonSocial.toLowerCase().includes(query)
      );
    });
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

  async cancelarPostulacion(id_postulacion: number | undefined) {
    if (!id_postulacion) return;

    const confirmado = await this.alertaService.confirmar('¿Estás seguro de que deseas retirar tu postulación a esta oferta?');
    if (!confirmado) return;

    this.postulacionesService.cancelarPostulacion(id_postulacion).subscribe(() => {
      this.alertaService.mostrar('Postulación retirada correctamente');
      const usuario = this.authService.getUsuarioActual();
      this.cargarPostulaciones(usuario);
    });
  }

  async eliminarPorModeracion(id_postulacion: number | undefined): Promise<void> {
    if (!id_postulacion) return;

    const confirmado = await this.alertaService.confirmar('¿Eliminar esta postulación del registro del sistema?');
    if (!confirmado) return;

    this.postulacionesService.eliminarPorModeracion(id_postulacion).subscribe({
      next: () => {
        this.postulaciones = this.postulaciones.filter(p => this.obtenerId(p) !== id_postulacion);
        this.alertaService.mostrar('Postulación eliminada del sistema correctamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar postulación:', err);
        this.alertaService.mostrar('No se pudo completar la eliminación.');
      }
    });
  }
  
  verPerfilPostulante(idPostulante?: number): void {
    if (idPostulante) {
      this.router.navigate(['/postulante', idPostulante]);
    }
  }

  // --- Métodos Auxiliares ---
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