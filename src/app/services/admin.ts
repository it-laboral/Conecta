import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

// 1. MODELOS DE DATOS (Ajusta los nombres según tu BD de Node.js)
export interface MetricasAdmin {
  totalOfertas: number;
  totalEmpresas: number;
  totalPostulantes: number;
  totalPostulaciones: number;
}

export interface EmpresaAdmin {
  id_empresa: number;
  razonSocial: string;
  cuit: string;
  email: string;
  telefono?: string;
  sector?: string;
  estado: string;
  [key: string]: any; // Para permitir campos adicionales dinámicos
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
  nombres?: string;      // 👈 Campo de tu BD (plural)
  apellidos?: string;    // 👈 Campo de tu BD (plural)
  nombre?: string;       // Opcional para compatibilidad
  apellido?: string;     // Opcional para compatibilidad
  dni?: string;
  legajo?: string;       // 👈 Campo agregado
  email?: string;
  carrera?: string;
  estado?: string;
  [key: string]: any;    // Permite campos dinámicos extra
}
export interface CategoriaAdmin {
  id: number;
  nombre: string;
}

export interface SkillAdmin {
  id: number;
  nombre: string;
  categoria_id: number;
  categoria_nombre?: string; // Nombre de la categoría para mostrar
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
  [key: string]: any; // Permite campos adicionales dinámicos
}


// 2. SERVICIO
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/admin';

  getMetricas(): Observable<MetricasAdmin> {
    return this.http.get<MetricasAdmin>(`${this.API_URL}/metricas`);
  }
// ------------------------------------------
  // B. GESTIÓN DE EMPRESAS
  // ------------------------------------------

  getEmpresas(): Observable<EmpresaAdmin[]> {
    return this.http.get<EmpresaAdmin[]>(`${this.API_URL}/empresas`);
  }

  cambiarEstadoEmpresa(id_empresa: number, estado: string): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.API_URL}/empresa/estado`, { id_empresa, estado });
  }
  // ------------------------------------------
  // C. GESTIÓN DE OFERTAS
  // ------------------------------------------
  getOfertas(): Observable<OfertaAdmin[]> {
    return this.http.get<OfertaAdmin[]>(`${this.API_URL}/ofertas`);
  }

  eliminarOferta(id_oferta: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.API_URL}/oferta/${id_oferta}`);
  }

  // ------------------------------------------
  // D. GESTIÓN DE POSTULANTES
  // ------------------------------------------
  getPostulantes(): Observable<PostulanteAdmin[]> {
    return this.http.get<PostulanteAdmin[]>(`${this.API_URL}/postulantes`);
  }

  // ------------------------------------------
  // E. CATÁLOGOS Y TABLAS MAESTRAS (Categorías y Skills)
  // ------------------------------------------
  getCategoriasSkills(): Observable<CategoriaAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/categorias-skills`).pipe(
      map(res => res.categorias || [])
    );
  }

  getSkills(): Observable<SkillAdmin[]> {
    return this.http.get<RespuestaApi>(`${this.API_URL}/skills`).pipe(
      map(res => res.skills || [])
    );
  }

  // Opcional: si necesitás obtener skills filtradas por una categoría en particular
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
}