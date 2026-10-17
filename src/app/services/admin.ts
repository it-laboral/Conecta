import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 1. MODELOS DE DATOS
export interface MetricasAdmin {
  totalOfertas: number;
  totalEmpresas: number;
  totalPostulantes: number;
  totalPostulaciones: number;
}

export interface PendientesCountResponse {
  success: boolean;
  totalPendientes: number;
  totalEmpresas: number;
  totalPostulantes: number;
}

export interface EmpresaAdmin {
  id_empresa: number;
  razonSocial: string;
  cuit: string;
  email: string;
  telefono?: string;
  sector?: string;
  estado: 'Pendiente' | 'Activo' | 'Inactivo' | string;
  [key: string]: any;
}

export interface OfertaAdmin {
  id_oferta: number;
  id_empresa: number;
  titulo: string;
  descripcion?: string;
  modalidad: string;
  experiencia: string;
  fecha_publicacion: string;
  dias_duracion: number;
  razonSocial?: string;
  estado?: string;
}

export interface PostulanteAdmin {
  id_postulante?: number;
  id?: number;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  legajo?: string;
  email?: string;
  carrera?: string;
  estado?: 'Pendiente' | 'Activo' | 'Inactivo' | string;
  [key: string]: any;
}

export interface CategoriaAdmin {
  id: number;
  nombre: string;
}

export interface SkillAdmin {
  id: number;
  nombre: string;
  categoria_id: number;
  categoria_nombre?: string;
}

export interface RespuestaApi {
  success: boolean;
  metricas?: MetricasAdmin;
  empresas?: EmpresaAdmin[];
  mensaje?: string;
  categorias?: CategoriaAdmin[];
  skills?: SkillAdmin[];
  ofertas?: OfertaAdmin[];
  postulantes?: PostulanteAdmin[];
  [key: string]: any;
}

// 2. SERVICIO
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/admin';

  // ------------------------------------------
  // A. MÉTRICAS Y NOTIFICACIONES PENDIENTES
  // ------------------------------------------

  getMetricas(): Observable<MetricasAdmin> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/metricas`).pipe(
      map(res => res.metricas || { totalOfertas: 0, totalEmpresas: 0, totalPostulantes: 0, totalPostulaciones: 0 })
    );
  }

  getPendientesCount(): Observable<PendientesCountResponse> {
    return this.http.get<PendientesCountResponse>(`${this.API_URL}/pendientes-count`);
  }

  // ------------------------------------------
  // B. GESTIÓN DE EMPRESAS
  // ------------------------------------------

  getEmpresas(): Observable<EmpresaAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/empresas`).pipe(
      map(res => res.empresas || [])
    );
  }

  cambiarEstadoEmpresa(id_empresa: number, estado: 'Pendiente' | 'Activo' | 'Inactivo' | string): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.API_URL}/empresa/estado`, { id_empresa, estado });
  }

  // ------------------------------------------
  // C. GESTIÓN DE OFERTAS
  // ------------------------------------------

  getOfertas(): Observable<OfertaAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/ofertas`).pipe(
      map(res => res.ofertas || [])
    );
  }

  eliminarOferta(id_oferta: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.API_URL}/ofertas/${id_oferta}`);
  }

  // ------------------------------------------
  // D. GESTIÓN DE POSTULANTES
  // ------------------------------------------

  getPostulantes(): Observable<PostulanteAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/postulantes`).pipe(
      map(res => res.postulantes || [])
    );
  }

  cambiarEstadoPostulante(id_postulante: number, estado: 'Pendiente' | 'Activo' | 'Inactivo' | string): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.API_URL}/postulante/estado`, { id_postulante, estado });
  }

  // ------------------------------------------
  // E. CATÁLOGOS Y TABLAS MAESTRAS (Categorías y Skills)
  // ------------------------------------------

  // ------------------------------------------
  // E. CATÁLOGOS Y TABLAS MAESTRAS (Categorías y Skills)
  // ------------------------------------------

  getCategoriasSkills(): Observable<CategoriaAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/categorias-skills`).pipe(
      map(res => res.categorias || [])
    );
  }

  // ➕ Métodos para administrar Categorías
  crearCategoria(nombre: string): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.API_URL}/categorias-skills`, { nombre });
  }

  actualizarCategoria(id: number, nombre: string): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.API_URL}/categorias-skills/${id}`, { nombre });
  }

  eliminarCategoria(id: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.API_URL}/categorias-skills/${id}`);
  }

  getSkills(): Observable<SkillAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/skills`).pipe(
      map(res => res.skills || [])
    );
  }

  getSkillsPorCategoria(idCategoria: number): Observable<SkillAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/categorias/${idCategoria}/skills`).pipe(
      map(res => res.skills || [])
    );
  }

  crearSkill(payload: { nombre: string; categoria_id: number }): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.API_URL}/skills`, payload);
  }

  actualizarSkill(id: number, payload: { nombre: string; categoria_id: number }): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.API_URL}/skills/${id}`, payload);
  }

  eliminarSkill(id: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.API_URL}/skills/${id}`);
  }

  // ------------------------------------------
  // 🟢 F. REPORTES Y BÚSQUEDAS AVANZADAS
  // ------------------------------------------

  getReportePostulantesSkills(filtros: { skill?: string; carrera?: string; estado?: string }): Observable<PostulanteAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/reportes/postulantes-skills`, { params: filtros as any }).pipe(
      map(res => res.postulantes || [])
    );
  }

  getReporteEmpresasStack(filtros: { tecnologia?: string; sector?: string }): Observable<EmpresaAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/reportes/empresas-stack`, { params: filtros as any }).pipe(
      map(res => res.empresas || [])
    );
  }

  getReporteOfertas(filtros: { titulo?: string; modalidad?: string }): Observable<OfertaAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/reportes/ofertas-busqueda`, { params: filtros as any }).pipe(
      map(res => res.ofertas || [])
    );
  }
}