import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulanteService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/postulante';

  getPerfil(idPostulante: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/perfil/${idPostulante}`
    );
  }

  actualizarPerfil(
    idPostulante: number,
    perfilData: any
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/perfil/${idPostulante}`,
      perfilData
    );
  }

  subirFotoPerfil(
    idPostulante: number,
    archivo: File
  ): Observable<any> {

    const formData = new FormData();

    formData.append('foto', archivo);

    return this.http.post(
      `${this.apiUrl}/perfil/${idPostulante}/foto`,
      formData
    );
  }

  getCatalogoSkills(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/skills/catalogo`
    );
  }

  subirCV(
    idPostulante: number,
    archivo: File
  ): Observable<any> {

    const formData = new FormData();

    formData.append('cv', archivo);

    return this.http.post(
      `${this.apiUrl}/perfil/${idPostulante}/cv`,
      formData
    );
  }

}