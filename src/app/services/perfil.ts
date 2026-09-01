import { Injectable } from '@angular/core';

// =========================================================
// ESTUDIOS
// =========================================================

export interface Estudio {
  titulo: string;
  institucion: string;
  estado: string;
}


// =========================================================
// EXPERIENCIA
// =========================================================

export interface Experiencia {
  empresa: string;
  puesto: string;
  desde: string;
  hasta: string;
  descripcion: string;
}


// =========================================================
// CURSOS
// =========================================================

export interface Curso {
  nombre: string;
  institucion: string;
  fecha: string;
  descripcion: string;
}


// =========================================================
// IDIOMAS
// =========================================================

export interface Idioma {
  idioma: string;
  nivel: string;
}


// =========================================================
// PROYECTOS
// =========================================================

export interface Proyecto {
  nombre: string;
  descripcion: string;
  tecnologias: string;
  enlace: string;
}


// =========================================================
// SKILL
// =========================================================

export interface SkillDTO {
  skill_id: number;
  categoria_id: number;
  nombre: string;
}


// =========================================================
// PERFIL DEL POSTULANTE
// =========================================================

export interface PerfilPostulante {

  nombres: string;

  apellidos: string;

  email: string;

  telefono: string;

  carrera: string;

  foto: string;

  ciudad: string;

  pais: string;


  // Perfil profesional
  sobre_mi: string;

  especialidad: string;

  estado_academico: string;


  // CV
  cv_url: string;

  cv_nombre: string;


  // Habilidades
  skills: SkillDTO[];

  otras_habilidades: string[] | string;


  // Redes
  redes: {

    github: string;

    linkedin: string;

    portfolio: string;

  };


  // Datos que todavía manejamos
  // localmente desde el CV.
  estudios: Estudio[];

  experiencias: Experiencia[];

  cursos: Curso[];

  idiomas: Idioma[];

  proyectos: Proyecto[];

}


// =========================================================
// SERVICIO
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class Perfil {

  private perfil: PerfilPostulante = {

    nombres: 'Sofía',

    apellidos: 'Rodríguez',

    email: 'sofia@email.com',

    telefono: '+54 11 1234-5678',

    carrera: 'Análisis de Sistemas',

    foto: '',

    ciudad: 'Lanús',

    pais: 'Argentina',


    // =====================================================
    // PERFIL PROFESIONAL
    // =====================================================

    sobre_mi:
      'Estudiante avanzada de Análisis de Sistemas. Me interesa el desarrollo Frontend y las soluciones con Inteligencia Artificial.',

    especialidad:
      'Desarrollo Frontend',

    estado_academico:
      'Estudiante Avanzado',


    // =====================================================
    // CV
    // =====================================================

    cv_url: '',

    cv_nombre: '',


    // =====================================================
    // HABILIDADES
    // =====================================================

    skills: [

      {
        skill_id: 1,
        categoria_id: 1,
        nombre: 'Angular'
      },

      {
        skill_id: 2,
        categoria_id: 1,
        nombre: 'TypeScript'
      },

      {
        skill_id: 3,
        categoria_id: 1,
        nombre: 'Sass'
      },

      {
        skill_id: 4,
        categoria_id: 2,
        nombre: 'SQL'
      }

    ],


    otras_habilidades: '',


    // =====================================================
    // REDES
    // =====================================================

    redes: {

      github:
        'https://github.com/sofia',

      linkedin:
        'https://linkedin.com/in/sofia',

      portfolio:
        'https://sofia.dev'

    },


    // =====================================================
    // INFORMACIÓN DEL CV
    // =====================================================

    estudios: [

      {

        titulo: 'Análisis de Sistemas',

        institucion: 'ITB',

        estado: 'En curso'

      }

    ],

    experiencias: [],

    idiomas: [],

    cursos: [],

    proyectos: []

  };


  // =========================================================
  // OBTENER PERFIL
  // =========================================================

  obtenerPerfil(): PerfilPostulante {

    return this.perfil;

  }


  // =========================================================
  // ACTUALIZAR PERFIL
  // =========================================================

  actualizarPerfil(
    datos: PerfilPostulante
  ): void {

    this.perfil = datos;

  }

}