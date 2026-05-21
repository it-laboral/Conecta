import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})
export class AuthService {
  // El HttpClient es el encargado de hacer las peticiones (como el cURL en PHP)
  private http = inject(HttpClient);
  
  // La URL de tu servidor o API
  private API_URL = 'http://localhost:3000/api';

  // Método para login ajustado a tu servidor
  login(credenciales: any): Observable<any> {
    // Esto llamará a http://localhost:3000/api/login
    return this.http.post(`${this.API_URL}/login`, credenciales);
  }

  // Registro de postulante
  registrarPostulante(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registrar/postulante`, datos);
  }

  // Registro de empresa
  registrarEmpresa(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registrar/empresa`, datos);
  }
}