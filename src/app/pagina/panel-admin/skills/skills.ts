import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminService, CategoriaAdmin, SkillAdmin } from '../../../services/admin';
import { AlertaService } from '../../../services/alerta.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class Skills implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly alertaService = inject(AlertaService);

  categorias: CategoriaAdmin[] = [];
  skills: SkillAdmin[] = [];
  skillsFiltradas: SkillAdmin[] = [];

  categoriaSeleccionadaId: number | 'todas' = 'todas';
  textoBusqueda: string = '';

  modalAbierto = false;
  modoEdicion = false;
  idSkillEnEdicion: number | null = null;
  cargando = false;

  skillForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    categoria_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarSkills();
  }

  // ==========================================
  // LÓGICA DE CATEGORÍAS
  // ==========================================
  cargarCategorias(): void {
    this.adminService.getCategoriasSkills().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  obtenerNombreCategoria(categoriaId: number): string {
    if (!categoriaId || this.categorias.length === 0) return 'Sin categoría';
    const cat = this.categorias.find(c => Number(c.id) === Number(categoriaId));
    return cat ? cat.nombre : 'Sin categoría';
  }

  agregarNuevaCategoria(): void {
    const nombre = prompt('Ingresá el nombre de la nueva categoría:');
    if (!nombre || !nombre.trim()) return;

    this.adminService.crearCategoria(nombre.trim()).subscribe({
      next: () => {
        this.cargarCategorias();
      },
      error: (err) => console.error('Error al crear categoría:', err)
    });
  }

  editarCategoriaActual(): void {
    if (this.categoriaSeleccionadaId === 'todas') {
      alert('Seleccioná una categoría específica para editar.');
      return;
    }

    const catActual = this.categorias.find(c => Number(c.id) === Number(this.categoriaSeleccionadaId));
    if (!catActual) return;

    const nuevoNombre = prompt('Editar nombre de la categoría:', catActual.nombre);
    if (!nuevoNombre || !nuevoNombre.trim() || nuevoNombre === catActual.nombre) return;

    this.adminService.actualizarCategoria(Number(catActual.id), nuevoNombre.trim()).subscribe({
      next: () => {
        this.cargarCategorias();
      },
      error: (err) => console.error('Error al actualizar categoría:', err)
    });
  }

  async eliminarCategoriaActual(): Promise<void> {
  if (this.categoriaSeleccionadaId === 'todas') {
    await this.alertaService.mostrar('Seleccioná una categoría específica para eliminar.');
    return;
  }

  // 1. Usamos tu servicio de alerta con la cajita turquesa
  const confirmado = await this.alertaService.confirmar('¿Estás seguro de eliminar esta categoría? Se desvinculará de sus habilidades.');
  
  if (!confirmado) return;

  // 2. Si acepta, se ejecuta la petición al servicio
  this.adminService.eliminarCategoria(Number(this.categoriaSeleccionadaId)).subscribe({
    next: () => {
      this.categoriaSeleccionadaId = 'todas';
      this.cargarCategorias();
      this.cargarSkills();
      this.alertaService.mostrar('Categoría eliminada correctamente');
    },
    error: (err) => {
      console.error('Error al eliminar categoría:', err);
      this.alertaService.mostrar('Ocurrió un error al intentar eliminar la categoría.');
    }
  });
}
  // ==========================================
  // LÓGICA DE SKILLS
  // ==========================================
  cargarSkills(): void {
    this.cargando = true;
    this.adminService.getSkills().subscribe({
      next: (data) => {
        this.skills = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar skills', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.skillsFiltradas = this.skills.filter((s) => {
      const coincideCategoria =
        this.categoriaSeleccionadaId === 'todas' ||
        s.categoria_id === Number(this.categoriaSeleccionadaId);

      const coincideTexto = s.nombre
        .toLowerCase()
        .includes(this.textoBusqueda.toLowerCase().trim());

      return coincideCategoria && coincideTexto;
    });
  }

  onBuscarTexto(event: Event): void {
    this.textoBusqueda = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  onSeleccionarCategoria(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.categoriaSeleccionadaId = valor === 'todas' ? 'todas' : Number(valor);
    this.aplicarFiltros();
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSkillEnEdicion = null;
    this.skillForm.reset();
    this.modalAbierto = true;
  }

  prepararEdicion(skill: SkillAdmin): void {
    this.modoEdicion = true;
    this.idSkillEnEdicion = skill.id;
    this.skillForm.patchValue({
      nombre: skill.nombre,
      categoria_id: skill.categoria_id
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.modoEdicion = false;
    this.idSkillEnEdicion = null;
    this.skillForm.reset();
  }

  guardarSkill(): void {
    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.skillForm.value.nombre,
      categoria_id: Number(this.skillForm.value.categoria_id)
    };

    if (this.modoEdicion && this.idSkillEnEdicion) {
      this.adminService.actualizarSkill(this.idSkillEnEdicion, payload).subscribe({
        next: () => {
          this.cargarSkills();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar skill:', err)
      });
    } else {
      this.adminService.crearSkill(payload).subscribe({
        next: () => {
          this.cargarSkills();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear skill:', err)
      });
    }
  }

  async eliminarSkill(id: number): Promise<void> {
  // 1. Reemplazamos el confirm() nativo por la cajita turquesa
  const confirmado = await this.alertaService.confirmar('¿Estás seguro de eliminar esta habilidad?');
  
  if (!confirmado) return;

  // 2. Si el usuario acepta, se ejecuta la petición normal
  this.adminService.eliminarSkill(id).subscribe({
    next: () => {
      this.cargarSkills();
      // Opcional: si querés mostrar un aviso de éxito después de borrar
      this.alertaService.mostrar('Habilidad eliminada correctamente');
    },
    error: (err) => {
      console.error('Error al eliminar skill:', err);
      this.alertaService.mostrar('Ocurrió un error al intentar eliminar la habilidad.');
    }
  });
}
}