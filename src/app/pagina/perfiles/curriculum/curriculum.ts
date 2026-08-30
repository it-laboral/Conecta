import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Perfil, PerfilPostulante } from '../../../services/perfil';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.css',
})
export class Curriculum implements OnInit {

  perfil!: PerfilPostulante;
  mostrandoVistaPrevia = false;

  // =========================
  // FORMACIÓN
  // =========================

  editandoFormacion = false;

  nuevaFormacion = {
    titulo: '',
    institucion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  // =========================
  // EXPERIENCIA LABORAL
  // =========================

  editandoExperiencia = false;

  nuevaExperiencia = {
    empresa: '',
    puesto: '',
    desde: '',
    hasta: '',
    descripcion: ''
  };

  // =========================
  // HABILIDADES
  // =========================

  editandoSkill = false;

  nuevaSkill = '';

  // =========================
  // IDIOMAS
  // =========================

  editandoIdioma = false;

  nuevoIdioma = {
    idioma: '',
    nivel: ''
  };

  // =========================
  // CURSOS Y CERTIFICACIONES
  // =========================

  editandoCurso = false;

  nuevoCurso = {
    nombre: '',
    institucion: '',
    fecha: '',
    descripcion: ''
  };

  // =========================
  // PROYECTOS
  // =========================

  editandoProyecto = false;

  nuevoProyecto = {
    nombre: '',
    descripcion: '',
    tecnologias: '',
    enlace: ''
  };

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(private perfilService: Perfil) {}

  // =========================
  // INICIO
  // =========================

  ngOnInit(): void {
    this.perfil = this.perfilService.obtenerPerfil();
  }

  // =========================
  // GUARDAR TODO EL CV
  // =========================

  guardarCV(): void {

    this.perfilService.actualizarPerfil(this.perfil);

    alert('¡CV guardado correctamente!');

    console.log('CV guardado:', this.perfil);
  }

  // =========================
  // FORMACIÓN
  // =========================

  agregarFormacion(): void {
    this.editandoFormacion = true;
  }

  guardarFormacion(): void {

    if (
      !this.nuevaFormacion.titulo ||
      !this.nuevaFormacion.institucion
    ) {
      alert('Completá el título y la institución.');
      return;
    }

    this.perfil.estudios.push({
      titulo: this.nuevaFormacion.titulo,
      institucion: this.nuevaFormacion.institucion,
      estado: this.nuevaFormacion.fechaFin
        ? `${this.nuevaFormacion.fechaInicio} - ${this.nuevaFormacion.fechaFin}`
        : `${this.nuevaFormacion.fechaInicio} - Actualidad`
    });

    this.perfilService.actualizarPerfil(this.perfil);

    this.nuevaFormacion = {
      titulo: '',
      institucion: '',
      fechaInicio: '',
      fechaFin: ''
    };

    this.editandoFormacion = false;

    alert('¡Formación guardada correctamente!');
  }

  cancelarFormacion(): void {

    this.nuevaFormacion = {
      titulo: '',
      institucion: '',
      fechaInicio: '',
      fechaFin: ''
    };

    this.editandoFormacion = false;
  }

  // =========================
  // EXPERIENCIA LABORAL
  // =========================

  agregarExperiencia(): void {
    this.editandoExperiencia = true;
  }

  guardarExperiencia(): void {

    if (
      !this.nuevaExperiencia.empresa ||
      !this.nuevaExperiencia.puesto
    ) {
      alert('Completá la empresa y el puesto.');
      return;
    }

    this.perfil.experiencias.push({
      empresa: this.nuevaExperiencia.empresa,
      puesto: this.nuevaExperiencia.puesto,
      desde: this.nuevaExperiencia.desde,
      hasta: this.nuevaExperiencia.hasta,
      descripcion: this.nuevaExperiencia.descripcion
    });

    this.perfilService.actualizarPerfil(this.perfil);

    this.nuevaExperiencia = {
      empresa: '',
      puesto: '',
      desde: '',
      hasta: '',
      descripcion: ''
    };

    this.editandoExperiencia = false;

    alert('¡Experiencia guardada correctamente!');
  }

  cancelarExperiencia(): void {

    this.nuevaExperiencia = {
      empresa: '',
      puesto: '',
      desde: '',
      hasta: '',
      descripcion: ''
    };

    this.editandoExperiencia = false;
  }

  // =========================
  // HABILIDADES
  // =========================

  agregarSkill(): void {
    this.editandoSkill = true;
  }

  guardarSkill(): void {

    const skill = this.nuevaSkill.trim();

    if (!skill) {
      alert('Escribí una habilidad.');
      return;
    }

    this.perfil.skills.push(skill);

    this.perfilService.actualizarPerfil(this.perfil);

    this.nuevaSkill = '';
    this.editandoSkill = false;

    alert('¡Habilidad guardada correctamente!');
  }

  cancelarSkill(): void {

    this.nuevaSkill = '';
    this.editandoSkill = false;
  }

  // =========================
  // IDIOMAS
  // =========================

  agregarIdioma(): void {
    this.editandoIdioma = true;
  }

  guardarIdioma(): void {

    if (
      !this.nuevoIdioma.idioma ||
      !this.nuevoIdioma.nivel
    ) {
      alert('Completá el idioma y el nivel.');
      return;
    }

    this.perfil.idiomas.push({
      idioma: this.nuevoIdioma.idioma,
      nivel: this.nuevoIdioma.nivel
    });

    this.perfilService.actualizarPerfil(this.perfil);

    this.nuevoIdioma = {
      idioma: '',
      nivel: ''
    };

    this.editandoIdioma = false;

    alert('¡Idioma guardado correctamente!');
  }

  cancelarIdioma(): void {

    this.nuevoIdioma = {
      idioma: '',
      nivel: ''
    };

    this.editandoIdioma = false;
  }

  // =========================
  // CURSOS Y CERTIFICACIONES
  // =========================

  agregarCurso(): void {
    this.editandoCurso = true;
  }

  guardarCurso(): void {

    if (
      !this.nuevoCurso.nombre ||
      !this.nuevoCurso.institucion
    ) {
      alert('Completá el nombre del curso y la institución.');
      return;
    }

    this.perfil.cursos.push({
      nombre: this.nuevoCurso.nombre,
      institucion: this.nuevoCurso.institucion,
      fecha: this.nuevoCurso.fecha,
      descripcion: this.nuevoCurso.descripcion
    });

    this.perfilService.actualizarPerfil(this.perfil);

    this.nuevoCurso = {
      nombre: '',
      institucion: '',
      fecha: '',
      descripcion: ''
    };

    this.editandoCurso = false;

    alert('¡Curso guardado correctamente!');
  }

  cancelarCurso(): void {

    this.nuevoCurso = {
      nombre: '',
      institucion: '',
      fecha: '',
      descripcion: ''
    };

    this.editandoCurso = false;
  }

  // =========================
  // PROYECTOS
  // =========================

  agregarProyecto(): void {
    this.editandoProyecto = true;
  }

  guardarProyecto(): void {

    if (
      !this.nuevoProyecto.nombre ||
      !this.nuevoProyecto.descripcion
    ) {
      alert('Completá el nombre y la descripción del proyecto.');
      return;
    }

    this.perfil.proyectos.push({
      nombre: this.nuevoProyecto.nombre,
      descripcion: this.nuevoProyecto.descripcion,
      tecnologias: this.nuevoProyecto.tecnologias,
      enlace: this.nuevoProyecto.enlace
    });

    this.perfilService.actualizarPerfil(this.perfil);

    this.nuevoProyecto = {
      nombre: '',
      descripcion: '',
      tecnologias: '',
      enlace: ''
    };

    this.editandoProyecto = false;

    alert('¡Proyecto guardado correctamente!');
  }

  cancelarProyecto(): void {

    this.nuevoProyecto = {
      nombre: '',
      descripcion: '',
      tecnologias: '',
      enlace: ''
    };

    this.editandoProyecto = false;
  }

  // =========================
  // VISTA PREVIA
  // =========================

  abrirVistaPrevia(): void {
    this.perfilService.actualizarPerfil(this.perfil);
    this.mostrandoVistaPrevia = true;
  }

  cerrarVistaPrevia(): void {
    this.mostrandoVistaPrevia = false;
  }

  // =========================
  // DESCARGAR CV EN PDF
  // =========================

  async descargarCV(): Promise<void> {

    const elemento = document.querySelector('.cv-preview') as HTMLElement;

    if (!elemento) {
      alert('No se pudo preparar el CV para descargar.');
      return;
    }

    try {

      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const anchoPDF = 210;
      const altoPDF = 297;

      const anchoImagen = anchoPDF;
      const altoImagen =
        (canvas.height * anchoImagen) / canvas.width;

      let posicionY = 0;

      pdf.addImage(
        imgData,
        'PNG',
        0,
        posicionY,
        anchoImagen,
        altoImagen
      );

      let alturaRestante = altoImagen - altoPDF;

      while (alturaRestante > 0) {

        posicionY -= altoPDF;

        pdf.addPage();

        pdf.addImage(
          imgData,
          'PNG',
          0,
          posicionY,
          anchoImagen,
          altoImagen
        );

        alturaRestante -= altoPDF;
      }

      const nombreArchivo =
        `CV-${this.perfil.nombres}-${this.perfil.apellidos}.pdf`;

      pdf.save(nombreArchivo);

    } catch (error) {

      console.error('Error al generar el PDF:', error);

      alert('No se pudo generar el PDF.');

    }
  }

}