import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface RespuestaApi {
  success: boolean;
  metricas?: MetricasAdmin;
  empresas?: EmpresaAdmin[];
  mensaje?: string;
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

  getEmpresas(): Observable<EmpresaAdmin[]> {
    return this.http.get<EmpresaAdmin[]>(`${this.API_URL}/empresas`);
  }

  cambiarEstadoEmpresa(id_empresa: number, estado: string): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.API_URL}/empresa/estado`, { id_empresa, estado });
  }
  getOfertas(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/ofertas`);
  }

  getPostulantes(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/postulantes`);
  }

  eliminarOferta(id_oferta: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.API_URL}/oferta/${id_oferta}`);
  }
}