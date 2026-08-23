import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminService, CategoriaAdmin, SkillAdmin } from '../../../services/admin';

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

  cargarCategorias(): void {
    this.adminService.getCategoriasSkills().subscribe({
      next: (data) => (this.categorias =data),
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }
  obtenerNombreCategoria(categoriaId: number): string {
  if (!categoriaId || this.categorias.length === 0) return 'Sin categoría';
  const cat = this.categorias.find(c => Number(c.id) === Number(categoriaId));
  return cat ? cat.nombre : 'Sin categoría';
}

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

  eliminarSkill(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta habilidad?')) {
      this.adminService.eliminarSkill(id).subscribe({
        next: () => this.cargarSkills(),
        error: (err) => console.error('Error al eliminar skill:', err)
      });
    }
  }

}