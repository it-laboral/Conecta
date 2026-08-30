import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private API_URL = 'http://localhost:3000/api';

  // Signals de estado inicializados de forma segura para SSR
  tipoUsuario = signal<string | null>(null);
  isLoggedIn = signal<boolean>(false);
  usuarioActual = signal<any>(null);

  constructor() {
    // La lectura de localStorage SOLO ocurre una vez en el cliente (navegador)
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const tipo = localStorage.getItem('tipoUsuario');
      const user = localStorage.getItem('usuario');
      if (token) {
        this.isLoggedIn.set(true);
        this.tipoUsuario.set(tipo);
        if (user) {
          try {
            this.usuarioActual.set(JSON.parse(user));
          } catch (e) {
            console.error('Error al parsear usuario de localStorage', e);
          }
        }
      }
    }
  }
      

  // ==========================================
  // LOGIN
  // ==========================================
  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta.success && respuesta.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', respuesta.token);
            localStorage.setItem('tipoUsuario', respuesta.tipo);
            localStorage.setItem('usuario', JSON.stringify(respuesta.user));
          }
          this.tipoUsuario.set(respuesta.tipo);
          this.usuarioActual.set(respuesta.user);
          this.isLoggedIn.set(true); // 👈 Actualiza la señal
        }
      })

    );
  }

  // ==========================================
  // REGISTROS
  // ==========================================
  registrarPostulante(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registrar/postulante`, datos);
  }

  registrarEmpresa(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registrar/empresa`, datos);
  }

  // ==========================================
  // CONSULTAS Y LOGOUT
  // ==========================================
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getTipoUsuario(): string | null {
    return this.tipoUsuario();
  }

  getUsuarioActual(): any {
    return this.usuarioActual(); // 👈 Retorna directamente el valor de la Signal
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('tipoUsuario');
      localStorage.removeItem('usuario');
    }
    this.tipoUsuario.set(null);
    this.usuarioActual.set(null);
    this.isLoggedIn.set(false); // 👈 Limpia la señal
  }
}