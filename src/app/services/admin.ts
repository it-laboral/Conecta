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

  eliminarOferta(id_oferta: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.API_URL}/oferta/${id_oferta}`);
  }
}