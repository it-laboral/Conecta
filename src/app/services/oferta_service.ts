import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private apiUrl = 'http://localhost:3000/api'; // La URL de tu backend

  constructor(private http: HttpClient) {}

  publicarOferta(oferta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ofertas/crear`, oferta);
  }

  getOfertasVigentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ofertas/vigentes`);
  }

  getOfertasPorEmpresa(empresaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ofertas/empresa/${empresaId}`);
  }
}