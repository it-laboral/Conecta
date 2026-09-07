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
