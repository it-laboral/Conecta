import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  // HTTP
  private http = inject(HttpClient);

  // URL API
  private API_URL = 'http://localhost:3000/api';

  // LOGIN
  login(credenciales: any): Observable<any> {

    return this.http.post(

      `${this.API_URL}/login`,

      credenciales

    );

  }

  // REGISTRO POSTULANTE
  registrarPostulante(datos: any): Observable<any> {

    return this.http.post(

      `${this.API_URL}/registrar/postulante`,

      datos

    );

  }

  // REGISTRO EMPRESA
  registrarEmpresa(datos: any): Observable<any> {

    return this.http.post(

      `${this.API_URL}/registrar/empresa`,

      datos

    );

  }

}