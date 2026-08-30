import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulanteService {
  private http = inject(HttpClient);
  // Base alineada exactamente con server.js
  private apiUrl = 'http://localhost:3000/api/postulante';

  // 1. OBTENER PERFIL
  // Petición a: GET http://localhost:3000/api/postulante/perfil/:id
  getPerfil(idPostulante: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil/${idPostulante}`);
  }

  // 2. ACTUALIZAR PERFIL (DATOS DE TEXTO)
  // Petición a: PUT http://localhost:3000/api/postulante/perfil/:id
  actualizarPerfil(idPostulante: number, perfilData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/${idPostulante}`, perfilData);
  }

  // 3. SUBIR FOTO DE PERFIL
  // Petición a: POST http://localhost:3000/api/postulante/perfil/:id/foto
  subirFotoPerfil(idPostulante: number, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', archivo);

    return this.http.post(`${this.apiUrl}/perfil/${idPostulante}/foto`, formData);
  }

  // 4. OBTENER CATÁLOGO DE SKILLS
  // Petición a: GET http://localhost:3000/api/postulante/skills/catalogo
  getCatalogoSkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/skills/catalogo`);
  }
}