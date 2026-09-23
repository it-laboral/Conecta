import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { OfertaService } from '../../services/oferta_service';
import { PostulacionesService } from '../../services/postulaciones.service';
import { AuthService } from '../../services/auth.service';

export interface Skill {
  skill_id: number;
  nombre: string;
}

export interface CategoriaSkill {
  categoria_id: number;
  nombre: string;
  skills: Skill[];
}

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './ofertas.html',
  styleUrl: './ofertas.scss',
})
export class Ofertas implements OnInit {
  rolUsuario: string = '';
  idUsuario: string | null = '';
  nombreUsuario: string | null = '';

  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  idOfertaEnEdicion: number | null = null;
  ofertaForm!: FormGroup;

  categoriasConSkills: CategoriaSkill[] = [];
  skillsSeleccionadasIds: number[] = [];

  ofertasDeBaseDeDatos: any[] = [];
  ofertasFiltradas: any[] = [];
  ofertaSeleccionada: any = null;

  postulacionesRealizadas: Set<number> = new Set();

  searchQuery: string = '';
  filtroModalidad: string = 'todos';
  filtroEstado: 'todas' | 'abiertas' | 'cerradas' = 'abiertas';

  constructor(
    private fb: FormBuilder,
    private ofertaService: OfertaService,
    private postulacionesService: PostulacionesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuarioLogueado = this.authService.getUsuarioActual();
    
    // Normalizamos el rol en minúsculas ('postulante', 'empresa', 'admin')
    const rolRaw = this.authService.getTipoUsuario() || usuarioLogueado?.rol || 'visitante';
    this.rolUsuario = String(rolRaw).toLowerCase();

    this.idUsuario = usuarioLogueado ? String(usuarioLogueado.id_postulante || usuarioLogueado.id_empresa || usuarioLogueado.id) : null;
    this.nombreUsuario = usuarioLogueado ? usuarioLogueado.nombre : 'Usuario';

    this.inicializarFormulario();

    // 1. Cargar ofertas vigentes (Acceso público)
    this.cargarOfertasDesdeBackend();

    // 2. Solo si hay sesión iniciada cargamos categorías/skills y postulaciones
    if (usuarioLogueado) {
      this.cargarHabilidadesYCategorias();

      if (this.rolUsuario === 'postulante') {
        this.cargarMisPostulaciones();
      }
    }
  }

  inicializarFormulario(): void {
    this.ofertaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      modalidad: ['Híbrido', Validators.required],
      experiencia: ['Junior', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      tipoDuracion: ['10', Validators.required],
      diasPersonalizados: [null]
    });
  }

  resetearFormulario(): void {
    this.modoEdicion = false;
    this.idOfertaEnEdicion = null;
    this.skillsSeleccionadasIds = [];
    this.ofertaForm.reset({ 
      modalidad: 'Híbrido', 
      experiencia: 'Junior', 
      tipoDuracion: '10' 
    });
  }

  get skillsSeleccionadasObjetos(): Skill[] {
    const seleccionadas: Skill[] = [];
    for (const cat of this.categoriasConSkills) {
      for (const skill of cat.skills) {
        if (this.skillsSeleccionadasIds.includes(skill.skill_id)) {
          seleccionadas.push(skill);
        }
      }
    }
    return seleccionadas;
  }

  cargarMisPostulaciones(): void {
    if (!this.idUsuario) return;
    this.postulacionesService.getByPostulante(Number(this.idUsuario)).subscribe({
      next: (postulaciones) => {
        this.postulacionesRealizadas = new Set(postulaciones.map(p => Number(p.id_oferta)));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al obtener postulaciones:', err)
    });
  }

  cargarOfertasDesdeBackend(): void {
    this.ofertaService.getOfertasVigentes().subscribe({
      next: (data: any[]) => {
        this.ofertasDeBaseDeDatos = (data || []).map(o => {
          const fechaDetectada = 
            o.fecha_publicacion || 
            o.fechaPublicacion || 
            o.created_at || 
            o.createdAt || 
            o.fecha_creacion || 
            o.fecha;

          return {
            ...o,
            dias_duracion: o.dias_duracion || o.diasDuracion || 10,
            fecha_publicacion: fechaDetectada
          };
        });

        this.filtrarOfertasLocal();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar ofertas:', err)
    });
  }

  cargarHabilidadesYCategorias(): void {
    this.ofertaService.getCategoriasConSkills().subscribe({
      next: (data) => {
        this.categoriasConSkills = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar habilidades:', err)
    });
  }

  onTipoDuracionChange(): void {
    const tipo = this.ofertaForm.get('tipoDuracion')?.value;
    const controlDias = this.ofertaForm.get('diasPersonalizados');
    if (tipo === 'personalizado') {
      controlDias?.setValidators([Validators.required, Validators.min(1), Validators.max(90)]);
    } else {
      controlDias?.clearValidators();
      controlDias?.setValue(null);
    }
    controlDias?.updateValueAndValidity();
  }

  alternarHabilidad(skill_Id: number): void {
    const index = this.skillsSeleccionadasIds.indexOf(skill_Id);
    if (index > -1) {
      this.skillsSeleccionadasIds.splice(index, 1);
    } else {
      this.skillsSeleccionadasIds.push(skill_Id);
    }
  }

  seleccionarOferta(oferta: any): void {
    if (!oferta) return;
    this.ofertaSeleccionada = {
      ...oferta,
      id_oferta: oferta.id_oferta || oferta.id,
      dias_duracion: oferta.dias_duracion || oferta.diasDuracion || 10,
      skills_nombres: oferta.skills_nombres || []
    };
  }

  private seleccionarPrimeraDisponible(lista: any[]): void {
    if (lista.length > 0) {
      this.seleccionarOferta(lista[0]);
    } else {
      this.ofertaSeleccionada = null;
    }
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.ofertaForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleVista(verForm: boolean, editarOferta: any = null): void {
    this.mostrarFormulario = verForm;

    if (verForm) {
      if (this.categoriasConSkills.length === 0) {
        this.cargarHabilidadesYCategorias();
      }

      if (editarOferta) {
        this.modoEdicion = true;
        this.idOfertaEnEdicion = editarOferta.id_oferta;
        this.ofertaForm.patchValue({
          titulo: editarOferta.titulo,
          modalidad: editarOferta.modalidad,
          experiencia: editarOferta.experiencia,
          descripcion: editarOferta.descripcion,
          tipoDuracion: String(editarOferta.dias_duracion || '10')
        });
        this.skillsSeleccionadasIds = [...(editarOferta.skills_ids || [])];
      } else {
        this.resetearFormulario();
      }
    } else {
      this.resetearFormulario();
    }
  }

  verPostulados(idOferta: number): void {
    if (!idOferta) return;
    this.router.navigate(['/postulaciones'], { queryParams: { oferta: idOferta } });
  }

  esOfertaAbierta(oferta: any): boolean {
    if (!oferta) return false;

    if (oferta.estado === 'Cerrada' || oferta.estado === 'Finalizada') return false;
    if (oferta.estado === 'Abierta') return true;

    if (!oferta.fecha_publicacion || !oferta.dias_duracion) return false;

    const fechaLimpia = String(oferta.fecha_publicacion).trim().split('T')[0].replace(/\//g, '-');
    const partes = fechaLimpia.split('-');

    if (partes.length < 3) return false;

    const anio = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    const fechaInicio = new Date(anio, mes, dia);
    if (isNaN(fechaInicio.getTime())) return false;

    const fechaVencimiento = new Date(fechaInicio);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + Number(oferta.dias_duracion));
    fechaVencimiento.setHours(23, 59, 59, 999);

    return new Date() <= fechaVencimiento;
  }

  obtenerFechaVencimiento(oferta: any): Date | null {
    if (!oferta || !oferta.fecha_publicacion || !oferta.dias_duracion) return null;

    const fechaLimpia = String(oferta.fecha_publicacion).trim().split('T')[0].replace(/\//g, '-');
    const partes = fechaLimpia.split('-');

    if (partes.length < 3) return null;

    const anio = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    const fechaInicio = new Date(anio, mes, dia);
    if (isNaN(fechaInicio.getTime())) return null;

    const fechaVencimiento = new Date(fechaInicio);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + Number(oferta.dias_duracion));
    
    return fechaVencimiento;
  }
  
  filtrarOfertasLocal(): void {
    this.ofertasFiltradas = this.ofertasDeBaseDeDatos.filter(o => {
      const coincideBusqueda = 
        o.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (o.razonSocial && o.razonSocial.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (o.skills_nombres && o.skills_nombres.some((s: string) => s.toLowerCase().includes(this.searchQuery.toLowerCase())));

      const coincideModalidad = this.filtroModalidad === 'todos' || o.modalidad === this.filtroModalidad;

      const abierta = this.esOfertaAbierta(o);

      let coincideEstado = true;
      if (this.filtroEstado === 'abiertas') coincideEstado = abierta;
      if (this.filtroEstado === 'cerradas') coincideEstado = !abierta;

      return coincideBusqueda && coincideModalidad && coincideEstado;
    });

    this.sincronizarSeleccionDerecha();
  }

  cambiarFiltroEstado(estado: 'todas' | 'abiertas' | 'cerradas'): void {
    this.filtroEstado = estado;
    this.filtrarOfertasLocal();
  }

  cambiarFiltroModalidad(modalidad: string): void {
    this.filtroModalidad = modalidad;
    this.filtrarOfertasLocal();
  }

  private sincronizarSeleccionDerecha(): void {
    if (!this.ofertaSeleccionada || !this.ofertasFiltradas.some(o => o.id_oferta === this.ofertaSeleccionada.id_oferta)) {
      this.seleccionarPrimeraDisponible(this.ofertasFiltradas);
    }
  }

  guardarOferta(): void {
    if (this.ofertaForm.invalid || this.skillsSeleccionadasIds.length === 0) {
      this.ofertaForm.markAllAsTouched();
      alert('Por favor completa los campos obligatorios y selecciona al menos una habilidad.');
      return;
    }

    const fValue = this.ofertaForm.value;
    const diasFinales = fValue.tipoDuracion === 'personalizado' 
      ? Number(fValue.diasPersonalizados) 
      : Number(fValue.tipoDuracion);

    const payload = {
      id_empresa: Number(this.idUsuario || 0),
      titulo: fValue.titulo,
      descripcion: fValue.descripcion,
      modalidad: fValue.modalidad,
      experiencia: fValue.experiencia,
      dias_duracion: diasFinales,
      skill: [...this.skillsSeleccionadasIds]
    };

    const peticion$ = (this.modoEdicion && this.idOfertaEnEdicion)
      ? this.ofertaService.actualizarOferta(this.idOfertaEnEdicion, payload)
      : this.ofertaService.publicarOferta(payload);

    peticion$.subscribe({
      next: () => {
        alert(this.modoEdicion ? 'Oferta actualizada con éxito.' : 'Oferta publicada con éxito.');
        this.resetearFormulario();
        this.toggleVista(false);
        this.cargarOfertasDesdeBackend();
      },
      error: (err) => {
        console.error('Error al guardar la oferta:', err);
        
        if (err.status === 403) {
          alert('Acceso denegado (403): Tu usuario no cuenta con el rol "Empresa" o la sesión expiró.');
        } else {
          alert(err.error?.error || err.error?.mensaje || 'Error al procesar la solicitud en el servidor.');
        }
      }
    });
  }

  cambiarEstadoOferta(ofertaId: number, nuevoEstado: 'Abierta' | 'Cerrada'): void {
    if (confirm(`¿Confirma que desea marcar esta oferta como ${nuevoEstado}?`)) {
      this.ofertaService.cambiarEstado(ofertaId, nuevoEstado).subscribe({
        next: () => {
          if (this.ofertaSeleccionada && this.ofertaSeleccionada.id_oferta === ofertaId) {
            this.ofertaSeleccionada.estado = nuevoEstado;
          }
          const item = this.ofertasDeBaseDeDatos.find(o => o.id_oferta === ofertaId);
          if (item) item.estado = nuevoEstado;
          this.filtrarOfertasLocal();
          alert(`La oferta ahora está ${nuevoEstado}.`);
        },
        error: (err) => console.error('Error al cambiar estado:', err)
      });
    }
  }

  ampliarDuracion(ofertaId: number): void {
    const diasStr = prompt('¿Cuántos días desea agregar al plazo de vigencia?', '10');
    const dias = Number(diasStr);

    if (dias && dias > 0) {
      this.ofertaService.ampliarPlazo(ofertaId, dias).subscribe({
        next: () => {
          if (this.ofertaSeleccionada && this.ofertaSeleccionada.id_oferta === ofertaId) {
            this.ofertaSeleccionada.dias_duracion = Number(this.ofertaSeleccionada.dias_duracion) + dias;
          }
          this.cargarOfertasDesdeBackend();
          alert(`Plazo ampliado exitosamente en ${dias} días.`);
        },
        error: (err) => console.error('Error al ampliar plazo:', err)
      });
    }
  }

  guardarPostulacion(ofertaId: number): void {
    if (!this.idUsuario) {
      alert('Debes iniciar sesión para postularte a una oferta laboral.');
      this.router.navigate(['/sesion']);
      return;
    }

    if (this.postulacionesRealizadas.has(ofertaId)) {
      alert('Ya te has postulado a esta oferta laboral.');
      return;
    }

    this.postulacionesService.crearPostulacion(ofertaId).subscribe({
      next: () => {
        alert('¡Postulación enviada con éxito!');
        this.postulacionesRealizadas.add(ofertaId);
        this.postulacionesRealizadas = new Set(this.postulacionesRealizadas);
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error?.mensaje || 'Error al procesar la postulación.')
    });
  }

  estaPostulado(ofertaId: number): boolean {
    return this.postulacionesRealizadas.has(ofertaId);
  }

  bajaOfertaAdmin(ofertaId: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta oferta de manera permanente?')) {
      this.ofertaService.eliminarOferta(ofertaId).subscribe({
        next: () => {
          this.ofertasDeBaseDeDatos = this.ofertasDeBaseDeDatos.filter(o => o.id_oferta !== ofertaId);
          this.filtrarOfertasLocal();
          alert(`Oferta N° ${ofertaId} eliminada.`);
        },
        error: (err) => console.error('Error al eliminar oferta:', err)
      });
    }
  }
}