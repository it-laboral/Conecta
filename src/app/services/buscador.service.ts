import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuscadorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Helper privado para armar las cabeceras con el Token JWT
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token'); // Ajusta 'token' si usas otro nombre de clave o sessionStorage
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  // Endpoint protegido para listar empresas (usado por el postulante)
  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa`, this.getHeaders());
  }

  // Endpoint protegido para listar postulantes (usado por la empresa)
  getPostulantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/postulante`, this.getHeaders());
  }
}