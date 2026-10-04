import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  // Variable para recordar el idioma activo en el selector
  public idiomaActual: string = 'es';
  public dropdownAbierto: boolean = false;

  ngOnInit(): void {
    // Al cargar el componente, leemos qué idioma estaba guardado
    const idiomaGuardado = localStorage.getItem('idioma_seleccionado');
    if (idiomaGuardado) {
      this.idiomaActual = idiomaGuardado;
    }
  }
  // 1. MÉTODO AGREGADO: Abre y cierra el menú desplegable
  toggleDropdown(): void {
    this.dropdownAbierto = !this.dropdownAbierto;
  }
/**
   * Mapea el código de idioma a la ruta de la bandera local en /public/banderas/
   */
  obtenerBandera(idioma: string): string {
    const banderas: Record<string, string> = {
      es: 'banderas/ar.png', // O .png según como guardaste tu archivo
      en: 'banderas/us.png',
      pt: 'banderas/br.png'
    };
    return banderas[idioma] || 'banderas/ar.png';
  }

  traducirA(idioma: string): void {
    this.idiomaActual = idioma;
    this.dropdownAbierto = false; // Cerramos el menú desplegable al eleg
    localStorage.setItem('idioma_seleccionado', idioma);

    const win = window as any;
    if (typeof win.cambiarIdiomaGlobal === 'function') {
      win.cambiarIdiomaGlobal(idioma);
    }
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.authService.logout();
    this.router.navigate(['/sesion']);
  }

  irPerfil(): void {
    const tipo = localStorage.getItem('tipo');

    if (tipo === 'empresa') {
      this.router.navigate(['/perfil-empresa']);
    } else if (tipo === 'postulante') {
      this.router.navigate(['/perfil-postulante']);
    } else {
      this.router.navigate(['/sesion']);
    }
  }
}