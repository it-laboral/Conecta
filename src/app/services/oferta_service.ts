import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Skill {
  skill_id: number;
  nombre: string;
}

export interface CategoriaSkill {
  categoria_id: number;
  nombre: string;
  skills: Skill[];
}

export type ModalidadOferta = 'Presencial' | 'Remoto' | 'Híbrido';
export type NivelExperiencia = 'Trainee' | 'Junior' | 'Semi-Senior' | 'Senior';

export interface Oferta {
  id_oferta?: number;
  id_empresa?: number;
  razonSocial?: string;
  titulo: string;
  descripcion: string;
  modalidad: ModalidadOferta;
  experiencia: NivelExperiencia; 
  dias_duracion: number;
  fecha_publicacion?: string;
  fecha_vencimiento?: string;
  skills?: number[];
  skill?: number[];
  skills_nombres?: string[];
}

export interface RespuestaCrearOferta {
  OK: boolean;
  message: string;
  id_oferta?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/ofertas';

  /** Obtener el listado de categorías con sus respectivas habilidades */
  getCategoriasConSkills(): Observable<CategoriaSkill[]> {
    return this.http.get<CategoriaSkill[]>(`${this.apiUrl}/categorias-skills`);
  }

  /** Obtener todas las ofertas laborales vigentes (para postulantes) */
  getOfertasVigentes(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/vigentes`);
  }

  /** Obtener ofertas creadas por una empresa específica */
  getOfertasPorEmpresa(empresaId: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  /** Publicar una nueva oferta laboral (Empresa / Admin) */
  publicarOferta(oferta: Partial<Oferta>): Observable<RespuestaCrearOferta> {
    return this.http.post<RespuestaCrearOferta>(`${this.apiUrl}/crear`, oferta);
  }

  /** Actualizar los datos de una oferta existente */
  actualizarOferta(idOferta: number, oferta: Partial<Oferta>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idOferta}`, oferta);
  }

  /** Cambiar el estado (Abierta / Cerrada) */
  cambiarEstado(idOferta: number, estado: 'Abierta' | 'Cerrada'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idOferta}/estado`, { estado });
  }

  /** Ampliar el plazo de vigencia en días */
  ampliarPlazo(idOferta: number, dias: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idOferta}/ampliar`, { dias });
  }

  /** Eliminar una oferta de la base de datos */
  eliminarOferta(idOferta: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idOferta}`);
  }
}