import { Component, inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PostulanteService } from '../../../services/postulante.service';
import { PerfilPostulante, SkillDTO } from '../../../services/perfil';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.scss',
})
export class Curriculum implements OnInit {
  private postulanteService = inject(PostulanteService);
  private cdr = inject(ChangeDetectorRef);

  // Referencia directa al contenedor del CV en la plantilla HTML (#cvPreview)
  @ViewChild('cvPreview') cvPreviewRef!: ElementRef<HTMLElement>;

  esDuenio: boolean = true;
  mostrandoVistaPrevia = false;
  idPostulante: number | null = null;

  // ESTADO INICIAL
  perfil: PerfilPostulante = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    carrera: '',
    foto: '',
    ciudad: '',
    pais: '',
    sobre_mi: '',
    especialidad: '',
    estado_academico: '',
    cv_url: '',
    cv_nombre: '',
    skills: [],
    otras_habilidades: [],
    redes: { github: '', linkedin: '', portfolio: '' },
    estudios: [],
    experiencias: [],
    cursos: [],
    idiomas: [],
    proyectos: []
  };

  // ESTADOS DE EDICIÓN
  editandoFormacion = false;
  nuevaFormacion = { titulo: '', institucion: '', fechaInicio: '', fechaFin: '' };

  editandoExperiencia = false;
  nuevaExperiencia = { empresa: '', puesto: '', desde: '', hasta: '', descripcion: '' };

  editandoSkill = false;
  nuevaSkill = '';

  editandoIdioma = false;
  nuevoIdioma = { idioma: '', nivel: '' };

  editandoCurso = false;
  nuevoCurso = { nombre: '', institucion: '', fecha: '', descripcion: '' };

  editandoProyecto = false;
  nuevoProyecto = { nombre: '', descripcion: '', tecnologias: '', enlace: '' };

  ngOnInit(): void {
    this.idPostulante = this.obtenerIdSesion();

    if (this.idPostulante) {
      console.log('ID de postulante cargado correctamente:', this.idPostulante);
      // Opcional: Cargar datos guardados del servidor
      // this.cargarPerfilServidor(this.idPostulante);
    } else {
      console.warn('Atención: No se encontró un ID de postulante en el localStorage.');
    }
  }

  private obtenerIdSesion(): number | null {
    const usuarioStorage = localStorage.getItem('usuario') || localStorage.getItem('user');

    if (usuarioStorage) {
      try {
        const parsed = JSON.parse(usuarioStorage);
        if (parsed && parsed.id) {
          return Number(parsed.id);
        }
      } catch (e) {
        console.error('Error al parsear el usuario del localStorage:', e);
      }
    }

    const idDirecto = localStorage.getItem('id');
    if (idDirecto && !isNaN(Number(idDirecto))) {
      return Number(idDirecto);
    }

    return null;
  }

  // FOTO DE PERFIL
  alSeleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.perfil.foto = reader.result as string;
    };
    reader.readAsDataURL(archivo);
  }

  quitarFoto(): void {
    this.perfil.foto = '';
  }

  // VISTA PREVIA
  abrirVistaPrevia(): void {
    this.mostrandoVistaPrevia = true;
  }

  cerrarVistaPrevia(): void {
    this.mostrandoVistaPrevia = false;
  }

  // FORMACIÓN ACADÉMICA
  agregarFormacion(): void {
    if (this.esDuenio) this.editandoFormacion = true;
  }

  guardarFormacion(): void {
    if (!this.nuevaFormacion.titulo.trim() || !this.nuevaFormacion.institucion.trim()) {
      alert('Completá el título y la institución.');
      return;
    }

    const estado = this.nuevaFormacion.fechaFin.trim()
      ? `${this.nuevaFormacion.fechaInicio} - ${this.nuevaFormacion.fechaFin}`
      : `${this.nuevaFormacion.fechaInicio} - Actualidad`;

    if (!this.perfil.estudios) this.perfil.estudios = [];

    this.perfil.estudios.push({
      titulo: this.nuevaFormacion.titulo.trim(),
      institucion: this.nuevaFormacion.institucion.trim(),
      estado: estado
    });

    this.cancelarFormacion();
  }

  cancelarFormacion(): void {
    this.nuevaFormacion = { titulo: '', institucion: '', fechaInicio: '', fechaFin: '' };
    this.editandoFormacion = false;
  }

  // EXPERIENCIA LABORAL
  agregarExperiencia(): void {
    if (this.esDuenio) this.editandoExperiencia = true;
  }

  guardarExperiencia(): void {
    if (!this.nuevaExperiencia.empresa.trim() || !this.nuevaExperiencia.puesto.trim()) {
      alert('Completá la empresa y el puesto.');
      return;
    }

    if (!this.perfil.experiencias) this.perfil.experiencias = [];

    this.perfil.experiencias.push({
      empresa: this.nuevaExperiencia.empresa.trim(),
      puesto: this.nuevaExperiencia.puesto.trim(),
      desde: this.nuevaExperiencia.desde.trim(),
      hasta: this.nuevaExperiencia.hasta.trim(),
      descripcion: this.nuevaExperiencia.descripcion.trim()
    });

    this.cancelarExperiencia();
  }

  cancelarExperiencia(): void {
    this.nuevaExperiencia = { empresa: '', puesto: '', desde: '', hasta: '', descripcion: '' };
    this.editandoExperiencia = false;
  }

  // HABILIDADES
  agregarSkill(): void {
    if (this.esDuenio) this.editandoSkill = true;
  }

  guardarSkill(): void {
    const nombreSkill = this.nuevaSkill.trim();
    if (!nombreSkill) {
      alert('Escribí una habilidad.');
      return;
    }

    if (!this.perfil.skills) this.perfil.skills = [];

    const nuevoSkill: SkillDTO = {
      skill_id: Date.now(),
      categoria_id: 0,
      nombre: nombreSkill
    };

    this.perfil.skills.push(nuevoSkill);
    this.cancelarSkill();
  }

  cancelarSkill(): void {
    this.nuevaSkill = '';
    this.editandoSkill = false;
  }

  // IDIOMAS
  agregarIdioma(): void {
    if (this.esDuenio) this.editandoIdioma = true;
  }

  guardarIdioma(): void {
    if (!this.nuevoIdioma.idioma.trim() || !this.nuevoIdioma.nivel.trim()) {
      alert('Completá el idioma y el nivel.');
      return;
    }

    if (!this.perfil.idiomas) this.perfil.idiomas = [];

    this.perfil.idiomas.push({
      idioma: this.nuevoIdioma.idioma.trim(),
      nivel: this.nuevoIdioma.nivel.trim()
    });

    this.cancelarIdioma();
  }

  cancelarIdioma(): void {
    this.nuevoIdioma = { idioma: '', nivel: '' };
    this.editandoIdioma = false;
  }

  // CURSOS Y CERTIFICACIONES
  agregarCurso(): void {
    if (this.esDuenio) this.editandoCurso = true;
  }

  guardarCurso(): void {
    if (!this.nuevoCurso.nombre.trim() || !this.nuevoCurso.institucion.trim()) {
      alert('Completá el nombre del curso y la institución.');
      return;
    }

    if (!this.perfil.cursos) this.perfil.cursos = [];

    this.perfil.cursos.push({
      nombre: this.nuevoCurso.nombre.trim(),
      institucion: this.nuevoCurso.institucion.trim(),
      fecha: this.nuevoCurso.fecha.trim(),
      descripcion: this.nuevoCurso.descripcion.trim()
    });

    this.cancelarCurso();
  }

  cancelarCurso(): void {
    this.nuevoCurso = { nombre: '', institucion: '', fecha: '', descripcion: '' };
    this.editandoCurso = false;
  }

  // PROYECTOS
  agregarProyecto(): void {
    if (this.esDuenio) this.editandoProyecto = true;
  }

  guardarProyecto(): void {
    if (!this.nuevoProyecto.nombre.trim() || !this.nuevoProyecto.descripcion.trim()) {
      alert('Completá el nombre y la descripción del proyecto.');
      return;
    }

    if (!this.perfil.proyectos) this.perfil.proyectos = [];

    this.perfil.proyectos.push({
      nombre: this.nuevoProyecto.nombre.trim(),
      descripcion: this.nuevoProyecto.descripcion.trim(),
      tecnologias: this.nuevoProyecto.tecnologias.trim(),
      enlace: this.nuevoProyecto.enlace.trim()
    });

    this.cancelarProyecto();
  }

  cancelarProyecto(): void {
    this.nuevoProyecto = { nombre: '', descripcion: '', tecnologias: '', enlace: '' };
    this.editandoProyecto = false;
  }

  // GENERACIÓN Y SUBIDA DE PDF CON MÁRGENES REALES EN TODAS LAS HOJAS
private async procesarPDF(descargarEnPC: boolean = true): Promise<void> {
  if (this.perfil?.cv_url && !this.esDuenio) {
    if (descargarEnPC) {
      const link = document.createElement('a');
      link.href = `http://localhost:3000${this.perfil.cv_url}`;
      link.download = this.perfil.cv_nombre || 'Curriculum.pdf';
      link.target = '_blank';
      link.click();
    }
    return;
  }

  // 1. Asegura que la vista previa esté montada en el DOM
  if (!this.mostrandoVistaPrevia) {
    this.abrirVistaPrevia();
    this.cdr.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  const elemento = (this.cvPreviewRef?.nativeElement || document.querySelector('.cv-preview')) as HTMLElement;

  if (!elemento) {
    alert('No se pudo preparar la vista del CV.');
    return;
  }

  try {
    // 2. Captura en canvas
    const canvas = await html2canvas(elemento, {
      scale: 2, // Calidad HD
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 800
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 3. Configuración A4 y Márgenes
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Márgenes deseados en mm
    const marginTop = 12;
    const marginBottom = 15;
    const marginLeft = 12;

    const printableWidth = pageWidth - (marginLeft * 2); // 186 mm
    const printableHeight = pageHeight - marginTop - marginBottom; // 270 mm de área útil por hoja

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let yOffset = 0;
    let page = 0;

    // 4. Renderizado con máscaras de margen por página
    while (heightLeft > 0) {
      if (page > 0) {
        pdf.addPage();
      }

      // Posición de la imagen para esta hoja
      const imgY = marginTop - yOffset;
      pdf.addImage(imgData, 'JPEG', marginLeft, imgY, imgWidth, imgHeight);

      // MÁSCARAS BLANCAS: Tapan cualquier texto que invada los márgenes superior e inferior
      pdf.setFillColor(255, 255, 255);
      
      // Margen Superior
      pdf.rect(0, 0, pageWidth, marginTop, 'F');
      
      // Margen Inferior (Garantiza los 15mm limpios al pie de página)
      pdf.rect(0, pageHeight - marginBottom, pageWidth, marginBottom, 'F');
      
      // Márgenes Laterales
      pdf.rect(0, 0, marginLeft, pageHeight, 'F');
      pdf.rect(pageWidth - marginLeft, 0, marginLeft, pageHeight, 'F');

      heightLeft -= printableHeight;
      yOffset += printableHeight;
      page++;
    }

    const nombreArchivo = `CV-${this.perfil?.nombres || 'Postulante'}-${this.perfil?.apellidos || ''}.pdf`;

    if (descargarEnPC) {
      pdf.save(nombreArchivo);
    }
    // 5. Subida al servidor
    if (!this.idPostulante) {
      this.idPostulante = this.obtenerIdSesion();
    }

    if (this.esDuenio && this.idPostulante) {
      const pdfBlob = pdf.output('blob');
      const archivoPDF = new File([pdfBlob], nombreArchivo, { type: 'application/pdf' });

      this.postulanteService.subirCV(this.idPostulante, archivoPDF).subscribe({
        next: (res: any) => {
          if (res?.cv_url) this.perfil.cv_url = res.cv_url;
          if (res?.cv_nombre) this.perfil.cv_nombre = res.cv_nombre;
          alert('¡CV guardado exitosamente en la plataforma!');
        },
        error: (err) => {
          console.error('Error en la petición de subir CV:', err);
          alert('Ocurrió un error al intentar guardar el CV en el servidor.');
        }
      });
    } else {
      alert('Atención: No se detectó tu sesión (ID de postulante). El PDF se generó pero no se guardó en la base de datos.');
    }
  } catch (error) {
    console.error('Error al procesar el PDF:', error);
    alert('No se pudo procesar el PDF.');
  }
}

  async guardarCV(): Promise<void> {
    await this.procesarPDF(false);
  }

  async descargarCV(): Promise<void> {
    await this.procesarPDF(true);
  }

  verCV(): void {
    if (!this.perfil?.cv_url) {
      alert('Aún no hay ningún CV guardado en el servidor.');
      return;
    }

    const backendUrl = 'http://localhost:3000';
    const urlCompleta = this.perfil.cv_url.startsWith('http')
      ? this.perfil.cv_url
      : `${backendUrl}${this.perfil.cv_url}`;

    window.open(urlCompleta, '_blank');
  }
}