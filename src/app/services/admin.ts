import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3000/api/admin';

  getMetricas(): Observable<any> {
    return this.http.get(`${this.API_URL}/metricas`);
  }

  getEmpresas(): Observable<any> {
    return this.http.get(`${this.API_URL}/empresas`);
  }

  cambiarEstadoEmpresa(id_empresa: number, estado: string): Observable<any> {
    return this.http.put(`${this.API_URL}/empresa/estado`, { id_empresa, estado });
  }

  eliminarOferta(id_oferta: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/oferta/${id_oferta}`);
  }
}