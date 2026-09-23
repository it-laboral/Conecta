import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoPostulacion = 'Pendiente' | 'En Revision' | 'Aceptado' | 'Rechazado';

export interface Postulacion {
  id_postulacion?: number; 
  idPostulacion?: number; // Permite ambos formatos (snake_case y camelCase)
  id_postulante: number;
  id_oferta: number;
  fecha_postulacion?: string;
  estado?: EstadoPostulacion;

  // Campos mapeados desde JOINs (MySQL)
  titulo_oferta?: string;
  razon_social?: string;
  nombre_postulante?: string;
  apellido_postulante?: string;
  email_postulante?: string;
  carrera_postulante?: string;
  curriculum_url?: string;
}

export interface RespuestaApi {
  OK?: boolean;
  mensaje?: string;
  message?: string;
  id_postulacion?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostulacionesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/postulaciones';

  // ===================================================
  // 1. ACCIONES DEL POSTULANTE (Estudiante)
  // ===================================================
  
  /** Postularse a una oferta */
  crearPostulacion(id_oferta: number, id_postulante?: number): Observable<RespuestaApi> {
    const body = id_postulante ? { id_oferta, id_postulante } : { id_oferta };
    return this.http.post<RespuestaApi>(this.apiUrl, body);
  }

  /** Obtener postulaciones del estudiante logueado */
  getByPostulante(idPostulante: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/postulante/${idPostulante}`);
  }

  /** Cancelar postulación activa */
  cancelarPostulacion(idPostulacion: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/${idPostulacion}`);
  }

  // ===================================================
  // 2. ACCIONES DE LA EMPRESA
  // ===================================================
  
  /** Candidatos de todas las búsquedas de la empresa */
  getByEmpresa(idEmpresa: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/empresa/${idEmpresa}`);
  }

  /** Candidatos de una oferta en particular */
  getByOferta(idOferta: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/oferta/${idOferta}`);
  }

  /** Actualizar estado ('Pendiente' | 'En Revision' | 'Aceptado' | 'Rechazado') */
  actualizarEstado(idPostulacion: number, estado: EstadoPostulacion): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.apiUrl}/${idPostulacion}/estado`, { estado });
  }

  // ===================================================
  // 3. ACCIONES DEL ADMINISTRADOR (Auditoría ITB)
  // ===================================================
  
  /** Obtener todas las postulaciones del sistema */
  getTodas(): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/todas`);
  }

  /** Eliminar postulación por moderación de Admin */
  eliminarPorModeracion(idPostulacion: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/admin/${idPostulacion}`);
  }
}