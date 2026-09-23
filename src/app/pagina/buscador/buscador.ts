import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BuscadorService } from '../../services/buscador.service';

import { EmpresaProfile } from '../perfiles/empresa-profile/empresa-profile';
import { PostulanteProfile } from '../perfiles/postulante-profile/postulante-profile';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule, EmpresaProfile, PostulanteProfile],
  templateUrl: './buscador.html',
  styleUrl: './buscador.scss'
})
export class Buscador implements OnInit {
  private authService = inject(AuthService);
  private buscadorService = inject(BuscadorService);
  private router = inject(Router);

  tipoUsuario: 'postulante' | 'empresa' = 'postulante';
  cargando: boolean = false;
  filtroTexto: string = '';
  items: any[] = [];

  empresaPerfilId: number | null = null;
  postulantePerfilId: number | null = null;

  ngOnInit(): void {
    this.obtenerUsuarioSesion();
    this.cargarDatos();
  }

  /**
   * Identifica si el usuario logueado es Empresa o Postulante/Estudiante
   */
  obtenerUsuarioSesion(): void {
    const usuario = this.authService.getUsuarioActual();
    let rolOtipo = '';

    // 1. Buscar dentro del objeto recuperado del AuthService
    if (usuario) {
      rolOtipo = (
        usuario.tipo || 
        usuario.rol || 
        usuario.tipo_usuario || 
        usuario.role || 
        usuario.user?.tipo || 
        usuario.user?.rol || 
        ''
      ).toString().toLowerCase();
    }

    // 2. Si no se detectó en el objeto, decodificar el payload JWT
    if (!rolOtipo) {
      rolOtipo = this.obtenerTipoDesdeJWT();
    }

    // 3. Fallback a LocalStorage directo
    if (!rolOtipo) {
      rolOtipo = (
        localStorage.getItem('tipo') || 
        localStorage.getItem('rol') || 
        ''
      ).toLowerCase();
    }

    console.log('👤 [Buscador] Usuario recuperado:', usuario);
    console.log('🎭 [Buscador] Rol detectado:', rolOtipo);

    if (rolOtipo.includes('empresa')) {
      this.tipoUsuario = 'empresa';
    } else if (
      rolOtipo.includes('postulante') || 
      rolOtipo.includes('alumno') || 
      rolOtipo.includes('estudiante')
    ) {
      this.tipoUsuario = 'postulante';
    } else {
      console.warn('⚠️ [Buscador] No se pudo determinar un rol específico. Asumiendo postulante por defecto.');
      const token = localStorage.getItem('token');
      if (!usuario && !token) {
        this.router.navigate(['/sesion']);
      }
    }
  }

  /**
   * Decodifica el token JWT almacenado para extraer los claims 'tipo' o 'rol'
   */
  private obtenerTipoDesdeJWT(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64);
      const parsed = JSON.parse(payloadDecoded);
      return (parsed.tipo || parsed.rol || parsed.role || '').toString().toLowerCase();
    } catch (e) {
      console.error('Error al decodificar token JWT:', e);
      return '';
    }
  }

  /**
   * Carga el listado completo según el tipo de usuario activo
   */
  cargarDatos(): void {
    this.cargando = true;
    this.items = [];

    if (this.tipoUsuario === 'postulante') {
      // El postulante busca/mira perfiles de EMPRESAS
      this.buscadorService.getEmpresas().subscribe({
        next: (res: any) => {
          this.items = this.normalizarRespuestaListado(res, 'empresas');
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar perfiles de empresas:', err);
          this.cargando = false;
        }
      });
    } else {
      // La empresa busca/mira perfiles de POSTULANTES / TALENTOS
      this.buscadorService.getPostulantes().subscribe({
        next: (res: any) => {
          this.items = this.normalizarRespuestaListado(res, 'postulantes');
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar perfiles de postulantes:', err);
          this.cargando = false;
        }
      });
    }
  }

  /**
   * Extrae el arreglo de la respuesta HTTP sin importar la estructura que devuelva el Backend
   */
  private normalizarRespuestaListado(res: any, clavePorDefecto: string): any[] {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.[clavePorDefecto] && Array.isArray(res[clavePorDefecto])) return res[clavePorDefecto];
    if (res?.resultados && Array.isArray(res.resultados)) return res.resultados;
    if (res?.items && Array.isArray(res.items)) return res.items;
    return [];
  }

  /**
   * Getter reactivo para filtrar los resultados ingresados en la barra de búsqueda
   */
  get resultadosFiltrados(): any[] {
    if (!this.filtroTexto.trim()) {
      return this.items;
    }

    const query = this.filtroTexto.toLowerCase().trim();

    return this.items.filter(item => {
      if (this.tipoUsuario === 'postulante') {
        // Búsqueda en Empresas
        const razonSocial = (item.fantasia || item.razonSocial || item.razon_social || '').toLowerCase();
        const rubro = (item.rubro || item.sector || '').toLowerCase();
        const descripcion = (item.descripcion || item.detalle || '').toLowerCase();
        const email = (item.email || item.correo || '').toLowerCase();

        return (
          razonSocial.includes(query) ||
          rubro.includes(query) ||
          descripcion.includes(query) ||
          email.includes(query)
        );
      } else {
        // Búsqueda en Postulantes
        const nombreCompleto = `${item.nombres || item.nombre || ''} ${item.apellidos || item.apellido || ''}`.toLowerCase();
        const carrera = (item.carrera || item.estado_academico || '').toLowerCase();
        const especialidad = (item.especialidad || item.experiencia || item.conocimientos || item.habilidades || '').toLowerCase();
        const descripcion = (item.descripcion || item.presentacion || '').toLowerCase();

        return (
          nombreCompleto.includes(query) ||
          carrera.includes(query) ||
          especialidad.includes(query) ||
          descripcion.includes(query)
        );
      }
    });
  }

  /**
   * Apertura y cierre de modales con validación de ID
   */
  abrirPerfilEmpresa(id: number | string): void {
    if (id !== undefined && id !== null) {
      this.empresaPerfilId = Number(id);
    }
  }

  cerrarPerfilEmpresa(): void {
    this.empresaPerfilId = null;
  }

  abrirPerfilPostulante(id: number | string): void {
    if (id !== undefined && id !== null) {
      this.postulantePerfilId = Number(id);
    }
  }

  cerrarPerfilPostulante(): void {
    this.postulantePerfilId = null;
  }
}