import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import { PostulanteService } from '../../../services/postulante.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// ==========================================
// INTERFACES Y DTOs
// ==========================================

export interface SkillDTO {
  skill_id: number;
  categoria_id: number;
  nombre: string;
}

export interface CategoriaSkillDTO {
  categoria_id: number;
  nombre_categoria: string;
  skills: SkillDTO[];
}

export interface RedesDTO {
  github: string;
  linkedin: string;
  portfolio: string;
}

export interface PostulantePerfilDTO {

  nombres: string;
  apellidos: string;
  email: string;
  carrera: string;

  foto?: string;

  ciudad: string;
  pais: string;

  sobre_mi: string;
  especialidad: string;
  estado_academico: string;

  // CV
  cv_url?: string;
  cv_nombre?: string;

  skills: SkillDTO[];

  otras_habilidades?: string;

  redes: RedesDTO;
}


// ==========================================
// PERFIL INICIAL
// ==========================================

export function inicializarPerfilPostulante(): PostulantePerfilDTO {

  return {

    nombres: '',
    apellidos: '',
    email: '',
    carrera: '',

    foto: '',

    ciudad: '',
    pais: '',

    sobre_mi: '',
    especialidad: '',
    estado_academico: 'Estudiante Avanzado',

    cv_url: '',
    cv_nombre: '',

    skills: [],

    otras_habilidades: '',

    redes: {
      github: '',
      linkedin: '',
      portfolio: ''
    }

  };

}


// ==========================================
// COMPONENTE
// ==========================================

@Component({

  selector: 'app-postulante-profile',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './postulante-profile.html',

  styleUrl: './postulante-profile.scss'

})
export class PostulanteProfile implements OnInit {


  // ==========================================
  // SERVICIOS
  // ==========================================

  private postulanteService =
    inject(PostulanteService);

  private platformId =
    inject(PLATFORM_ID);


  // ==========================================
  // DATOS DEL USUARIO
  // ==========================================

  idPostulanteLogueado: number = 0;

  perfil: PostulantePerfilDTO =
    inicializarPerfilPostulante();


  // ==========================================
  // ESTADOS
  // ==========================================

  guardando: boolean = false;

  mensajeEstado: string | null = null;


  // ==========================================
  // MODALES
  // ==========================================

  modalActivo:
    | 'principales'
    | 'sobreMi'
    | 'cv'
    | 'skills'
    | 'redes'
    | null = null;


  // ==========================================
  // SKILLS
  // ==========================================

  categoriasSkills: CategoriaSkillDTO[] = [];

  tempSkillsIds: number[] = [];

  tempOtrasHabilidades: string = '';

  busquedaSkill: string = '';


  // ==========================================
  // FOTO
  // ==========================================

  archivoFotoSeleccionado: File | null = null;

  fotoPreview: string | null = null;


  // ==========================================
  // CV
  // ==========================================

  archivoCVSeleccionado: File | null = null;

  mostrarVistaPreviaCV: boolean = false;

  cvPreviewUrl: string | null = null;

  subiendoCV: boolean = false;

  /**
   * URL temporal utilizada solamente
   * cuando generamos una vista previa
   * del CV creado automáticamente.
   */
  private cvPreviewGeneradoUrl: string | null = null;


  // ==========================================
  // FORMULARIOS TEMPORALES
  // ==========================================

  tempUbicacion = {

    ciudad: '',
    pais: ''

  };


  tempSobreMi = {

    sobre_mi: '',
    especialidad: '',
    estado_academico: ''

  };


  tempRedes: RedesDTO = {

    github: '',
    linkedin: '',
    portfolio: ''

  };


  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      const usuarioSesion =
        localStorage.getItem('usuario');


      if (usuarioSesion) {

        try {

          const userObj =
            JSON.parse(usuarioSesion);

          this.idPostulanteLogueado =
            userObj.id_postulante ||
            userObj.id ||
            1;

        } catch (error) {

          console.error(
            'Error al leer usuario de localStorage:',
            error
          );

          this.idPostulanteLogueado = 1;

        }

      } else {

        this.idPostulanteLogueado = 1;

      }

    } else {

      this.idPostulanteLogueado = 1;

    }


    this.obtenerDatosDelPostulante();

    this.cargarCatalogoSkills();

  }


  // ==========================================
  // FOTO DE PERFIL
  // ==========================================

  getFotoUrl(): string {

    if (this.fotoPreview) {

      return this.fotoPreview;

    }


    if (
      this.perfil &&
      this.perfil.foto
    ) {

      if (
        this.perfil.foto.startsWith('http')
      ) {

        return this.perfil.foto;

      }


      return `http://localhost:3000${this.perfil.foto}`;

    }


    return 'assets/img/default-avatar.png';

  }


  // ==========================================
  // SELECCIONAR FOTO
  // ==========================================

  onFotoSeleccionada(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      !input.files[0]
    ) {

      return;

    }


    const file =
      input.files[0];


    // Validar imagen

    if (
      !file.type.startsWith('image/')
    ) {

      alert(
        'Por favor seleccioná una imagen válida.'
      );

      input.value = '';

      return;

    }


    // Máximo 2 MB

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      alert(
        'La imagen no debe superar los 2MB.'
      );

      input.value = '';

      return;

    }


    this.archivoFotoSeleccionado =
      file;


    // Vista previa de la FOTO

    const reader =
      new FileReader();


    reader.onload = () => {

      this.fotoPreview =
        reader.result as string;

    };


    reader.readAsDataURL(file);


    // Subir automáticamente

    this.subirFotoPerfil();

  }


  // ==========================================
  // SUBIR FOTO
  // ==========================================

  subirFotoPerfil(): void {

    if (
      !this.archivoFotoSeleccionado ||
      !this.idPostulanteLogueado
    ) {

      return;

    }


    this.postulanteService
      .subirFotoPerfil(
        this.idPostulanteLogueado,
        this.archivoFotoSeleccionado
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'Respuesta al subir foto:',
            res
          );


          if (res.success) {

            this.perfil.foto =
              res.fotoUrl ||
              res.data ||
              '';


            this.archivoFotoSeleccionado =
              null;


            this.fotoPreview =
              null;


            alert(
              '¡Foto de perfil actualizada!'
            );

          } else {

            alert(
              res.message ||
              'No se pudo subir la foto.'
            );

          }

        },


        error: (err: any) => {

          console.error(
            'Error al subir foto:',
            err
          );


          this.fotoPreview = null;


          alert(
            err?.error?.message ||
            'Ocurrió un error al subir la foto de perfil.'
          );

        }

      });

  }


  // ==========================================
  // OBTENER PERFIL
  // ==========================================

  obtenerDatosDelPostulante(): void {

    if (
      !this.idPostulanteLogueado
    ) {

      return;

    }


    this.postulanteService
      .getPerfil(
        this.idPostulanteLogueado
      )
      .subscribe({

        next: (res) => {

          console.log(
            'Perfil recibido:',
            res
          );


          if (
            res.success &&
            res.data
          ) {

            this.perfil = {

              ...inicializarPerfilPostulante(),

              ...res.data,

              skills:
                res.data.skills || [],

              redes:
                res.data.redes || {

                  github: '',
                  linkedin: '',
                  portfolio: ''

                }

            };

          }

        },


        error: (err) => {

          console.error(
            'Error al obtener perfil:',
            err
          );

        }

      });

  }


  // ==========================================
  // GUARDAR PERFIL COMPLETO
  // ==========================================

  guardarPerfilCompleto(): void {

    if (
      !this.idPostulanteLogueado
    ) {

      alert(
        'No se identificó la sesión del usuario.'
      );

      return;

    }


    this.guardando = true;

    this.mensajeEstado = null;


    this.postulanteService
      .actualizarPerfil(
        this.idPostulanteLogueado,
        this.perfil
      )
      .subscribe({

        next: (res) => {

          this.guardando = false;


          if (res.success) {

            this.mensajeEstado =
              '¡Perfil guardado con éxito en la base de datos!';


            setTimeout(() => {

              this.mensajeEstado = null;

            }, 4000);


            this.obtenerDatosDelPostulante();

          } else {

            alert(
              res.message ||
              'No se pudieron guardar los cambios.'
            );

          }

        },


        error: (err) => {

          this.guardando = false;


          console.error(
            'Error al guardar perfil:',
            err
          );


          alert(
            err?.error?.message ||
            'Ocurrió un error al guardar los datos.'
          );

        }

      });

  }


  guardarCambiosEnBackend(): void {

    this.guardarPerfilCompleto();

  }


  // ==========================================
  // CATÁLOGO DE SKILLS
  // ==========================================

  cargarCatalogoSkills(): void {

    this.postulanteService
      .getCatalogoSkills()
      .subscribe({

        next: (res) => {

          if (res.success) {

            this.categoriasSkills =
              res.data;

          }

        },


        error: (err) => {

          console.error(
            'Error al cargar skills:',
            err
          );

        }

      });

  }


  // ==========================================
  // ABRIR MODAL
  // ==========================================

  abrirModal(
    tipo:
      | 'principales'
      | 'sobreMi'
      | 'cv'
      | 'skills'
      | 'redes'
  ): void {

    this.modalActivo = tipo;


    switch (tipo) {

      // --------------------------------------
      // UBICACIÓN
      // --------------------------------------

      case 'principales':

        this.tempUbicacion = {

          ciudad:
            this.perfil.ciudad,

          pais:
            this.perfil.pais

        };

        break;


      // --------------------------------------
      // SOBRE MÍ
      // --------------------------------------

      case 'sobreMi':

        this.tempSobreMi = {

          sobre_mi:
            this.perfil.sobre_mi || '',

          especialidad:
            this.perfil.especialidad || '',

          estado_academico:
            this.perfil.estado_academico ||
            'Estudiante Avanzado'

        };

        break;


      // --------------------------------------
      // SKILLS
      // --------------------------------------

      case 'skills':

        this.busquedaSkill = '';

        this.tempSkillsIds =
          this.perfil.skills.map(
            s => s.skill_id
          );

        this.tempOtrasHabilidades =
          this.perfil.otras_habilidades || '';

        break;


      // --------------------------------------
      // REDES
      // --------------------------------------

      case 'redes':

        this.tempRedes = {

          ...this.perfil.redes

        };

        break;


      // --------------------------------------
      // CV
      // --------------------------------------

      case 'cv':

        this.archivoCVSeleccionado =
          null;

        break;

    }

  }


  // ==========================================
  // CERRAR MODAL
  // ==========================================

  cerrarModal(): void {

    this.modalActivo = null;

    /*
     * Cerramos también cualquier vista previa
     * que pudiera estar abierta.
     */
    this.mostrarVistaPreviaCV = false;


    /*
     * Liberar URL temporal generada.
     */
    if (
      this.cvPreviewGeneradoUrl
    ) {

      try {

        URL.revokeObjectURL(
          this.cvPreviewGeneradoUrl
        );

      } catch {

        // No hacer nada

      }

      this.cvPreviewGeneradoUrl =
        null;

    }


    /*
     * Si existe una URL temporal del archivo
     * seleccionado, liberarla.
     */
    if (
      this.archivoCVSeleccionado &&
      this.cvPreviewUrl
    ) {

      try {

        URL.revokeObjectURL(
          this.cvPreviewUrl
        );

      } catch {

        // No hacer nada

      }

    }


    this.archivoCVSeleccionado =
      null;

    this.cvPreviewUrl =
      null;

  }


  // ==========================================
  // SELECCIONAR CV
  // ==========================================

  onArchivoCVSeleccionado(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      !input.files[0]
    ) {

      return;

    }


    const file =
      input.files[0];


    // --------------------------------------
    // VALIDAR PDF
    // --------------------------------------

    if (
      file.type !==
      'application/pdf'
    ) {

      alert(
        'Por favor seleccioná un archivo en formato PDF.'
      );

      input.value = '';

      return;

    }


    // --------------------------------------
    // MÁXIMO 5 MB
    // --------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        'El CV no puede superar los 5 MB.'
      );

      input.value = '';

      return;

    }


    // --------------------------------------
    // GUARDAR ARCHIVO
    // --------------------------------------

    this.archivoCVSeleccionado =
      file;


    /*
     * IMPORTANTE:
     *
     * Acá NO generamos ninguna vista previa.
     *
     * Antes teníamos:
     *
     * URL.createObjectURL(file)
     * this.mostrarVistaPreviaCV = true
     *
     * Eso hacía que al seleccionar el CV
     * apareciera automáticamente una vista
     * previa debajo/al costado.
     *
     * Ahora simplemente queda seleccionado
     * y esperamos a que el usuario presione
     * "Guardar CV".
     */

    this.cvPreviewUrl = null;

    this.mostrarVistaPreviaCV = false;

  }


  // ==========================================
  // GUARDAR / SUBIR CV
  // ==========================================

  guardarCV(): void {

    if (
      !this.archivoCVSeleccionado
    ) {

      alert(
        'Por favor seleccioná un archivo PDF.'
      );

      return;

    }


    if (
      !this.idPostulanteLogueado
    ) {

      alert(
        'No se identificó el usuario.'
      );

      return;

    }


    this.subiendoCV = true;


    this.postulanteService
      .subirCV(
        this.idPostulanteLogueado,
        this.archivoCVSeleccionado
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'Respuesta al subir CV:',
            res
          );


          if (res.success) {

            this.perfil.cv_url =
              res.cv_url || '';


            this.perfil.cv_nombre =
              res.cv_nombre || '';


            this.archivoCVSeleccionado =
              null;


            this.subiendoCV =
              false;


            this.mensajeEstado =
              '¡CV subido correctamente!';


            setTimeout(() => {

              this.mensajeEstado =
                null;

            }, 4000);


            this.cerrarVistaPreviaCV();

            this.cerrarModal();

          } else {

            this.subiendoCV =
              false;


            alert(
              res.message ||
              'No se pudo subir el CV.'
            );

          }

        },


        error: (err: any) => {

          console.error(
            'Error al subir CV:',
            err
          );


          this.subiendoCV =
            false;


          alert(
            err?.error?.message ||
            'Ocurrió un error al subir el CV.'
          );

        }

      });

  }


  // ==========================================
  // URL DEL CV GUARDADO
  // ==========================================

  getCVUrl(): string {

    if (
      !this.perfil.cv_url
    ) {

      return '';

    }


    if (
      this.perfil.cv_url.startsWith(
        'http'
      )
    ) {

      return this.perfil.cv_url;

    }


    return `http://localhost:3000${this.perfil.cv_url}`;

  }


  // ==========================================
  // VISTA PREVIA DEL CV SUBIDO
  // ==========================================

  verCV(): void {

    if (
      !this.perfil.cv_url
    ) {

      alert(
        'Todavía no tenés un CV adjuntado.'
      );

      return;

    }


    this.cvPreviewUrl =
      this.getCVUrl();


    this.mostrarVistaPreviaCV =
      true;

  }


  // ==========================================
  // CERRAR VISTA PREVIA
  // ==========================================

  cerrarVistaPreviaCV(): void {

    this.mostrarVistaPreviaCV =
      false;


    /*
     * Liberar URL temporal generada
     * automáticamente.
     */

    if (
      this.cvPreviewGeneradoUrl
    ) {

      try {

        URL.revokeObjectURL(
          this.cvPreviewGeneradoUrl
        );

      } catch {

        // No hacer nada

      }

      this.cvPreviewGeneradoUrl =
        null;

    }


    /*
     * Si el CV era un archivo seleccionado
     * manualmente, liberar su URL.
     *
     * Actualmente no se genera automáticamente
     * al seleccionar el archivo, pero dejamos
     * esta protección por seguridad.
     */

    if (
      this.archivoCVSeleccionado &&
      this.cvPreviewUrl
    ) {

      try {

        URL.revokeObjectURL(
          this.cvPreviewUrl
        );

      } catch {

        // No hacer nada

      }

    }


    /*
     * Si el CV viene desde el backend,
     * no hacemos revoke porque no es una
     * URL temporal.
     */

    this.cvPreviewUrl =
      null;

  }


  // ==========================================
  // CAMBIAR CV
  // ==========================================

  cambiarCV(): void {

    this.archivoCVSeleccionado =
      null;

    this.cerrarVistaPreviaCV();

    this.abrirModal('cv');

  }


  // ==========================================
  // GENERAR CONTENIDO HTML DEL CV
  // ==========================================

  private crearContenidoCV(): string {

    const nombre =
      this.escapeHtml(
        this.perfil.nombres || 'Nombre'
      );


    const apellido =
      this.escapeHtml(
        this.perfil.apellidos || 'Apellido'
      );


    const carrera =
      this.escapeHtml(
        this.perfil.carrera || ''
      );


    const email =
      this.escapeHtml(
        this.perfil.email || ''
      );


    const ciudad =
      this.escapeHtml(
        this.perfil.ciudad || ''
      );


    const pais =
      this.escapeHtml(
        this.perfil.pais || ''
      );


    const sobreMi =
      this.escapeHtml(
        this.perfil.sobre_mi || ''
      );


    const especialidad =
      this.escapeHtml(
        this.perfil.especialidad || ''
      );


    const estadoAcademico =
      this.escapeHtml(
        this.perfil.estado_academico || ''
      );


    const otrasHabilidades =
      this.escapeHtml(
        this.perfil.otras_habilidades || ''
      );


    const skills =
      this.perfil.skills || [];


    const redes =
      this.perfil.redes || {

        github: '',
        linkedin: '',
        portfolio: ''

      };


    const ubicacion = [
      ciudad,
      pais
    ]
      .filter(Boolean)
      .join(', ');


    const skillsHTML =
      skills.length > 0

        ? `

          <div class="skills">

            ${skills
              .map(skill => `

                <span class="skill">
                  ${this.escapeHtml(skill.nombre)}
                </span>

              `)
              .join('')}

          </div>

        `

        : '';


    const redesHTML = `

      ${
        redes.github
          ? `
            <div class="red">
              <strong>GitHub:</strong>
              ${this.escapeHtml(redes.github)}
            </div>
          `
          : ''
      }

      ${
        redes.linkedin
          ? `
            <div class="red">
              <strong>LinkedIn:</strong>
              ${this.escapeHtml(redes.linkedin)}
            </div>
          `
          : ''
      }

      ${
        redes.portfolio
          ? `
            <div class="red">
              <strong>Portfolio:</strong>
              ${this.escapeHtml(redes.portfolio)}
            </div>
          `
          : ''
      }

    `;


    return `

      <div class="cv-generado">

        <!-- ==================================
             ENCABEZADO
             ================================== -->

        <header class="cv-header">

          <h1>
            ${nombre} ${apellido}
          </h1>

          ${
            carrera
              ? `
                <div class="cv-carrera">
                  ${carrera}
                </div>
              `
              : ''
          }

          <div class="cv-datos">

            ${
              email
                ? `
                  <span>
                    ✉️ ${email}
                  </span>
                `
                : ''
            }

            ${
              ubicacion
                ? `
                  <span>
                    📍 ${ubicacion}
                  </span>
                `
                : ''
            }

          </div>

        </header>


        <!-- ==================================
             PERFIL PROFESIONAL
             ================================== -->

        ${
          sobreMi
            ? `

              <section>

                <h2>
                  Perfil Profesional
                </h2>

                <p>
                  ${sobreMi}
                </p>

              </section>

            `
            : ''
        }


        <!-- ==================================
             ESPECIALIDAD
             ================================== -->

        ${
          especialidad
            ? `

              <section>

                <h2>
                  Especialidad / Interés
                </h2>

                <p>
                  ${especialidad}
                </p>

              </section>

            `
            : ''
        }


        <!-- ==================================
             ESTADO ACADÉMICO
             ================================== -->

        ${
          estadoAcademico
            ? `

              <section>

                <h2>
                  Formación / Estado Académico
                </h2>

                <p>
                  ${estadoAcademico}
                </p>

              </section>

            `
            : ''
        }


        <!-- ==================================
             HABILIDADES
             ================================== -->

        ${
          skillsHTML
            ? `

              <section>

                <h2>
                  Stack Técnico y Habilidades
                </h2>

                ${skillsHTML}

              </section>

            `
            : ''
        }


        <!-- ==================================
             OTRAS HABILIDADES
             ================================== -->

        ${
          otrasHabilidades
            ? `

              <section>

                <h2>
                  Otras herramientas y conocimientos
                </h2>

                <p>
                  ${otrasHabilidades}
                </p>

              </section>

            `
            : ''
        }


        <!-- ==================================
             REDES
             ================================== -->

        ${
          redesHTML.trim()
            ? `

              <section>

                <h2>
                  Redes y Portafolio
                </h2>

                ${redesHTML}

              </section>

            `
            : ''
        }


      </div>

    `;

  }


  // ==========================================
  // ESCAPAR HTML
  // ==========================================

  private escapeHtml(
    texto: string
  ): string {

    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  }


  // ==========================================
  // GENERAR CSS DEL CV
  // ==========================================

  private obtenerEstilosCV(): string {

    return `

      * {
        box-sizing: border-box;
      }

      body {

        margin: 0;

        padding: 30px;

        background: #eeeeee;

        font-family:
          Arial,
          Helvetica,
          sans-serif;

        color: #222;

      }


      .cv-generado {

        width: 794px;

        min-height: 1123px;

        margin: auto;

        padding: 55px;

        background: white;

        box-sizing: border-box;

      }


      .cv-header {

        border-bottom:
          3px solid #222;

        padding-bottom: 22px;

        margin-bottom: 30px;

      }


      .cv-header h1 {

        margin: 0 0 8px 0;

        font-size: 34px;

        font-weight: 700;

        color: #111;

      }


      .cv-carrera {

        font-size: 18px;

        font-weight: 600;

        color: #555;

        margin-bottom: 15px;

      }


      .cv-datos {

        display: flex;

        flex-wrap: wrap;

        gap: 18px;

        font-size: 14px;

        color: #555;

      }


      section {

        margin-bottom: 27px;

      }


      section h2 {

        font-size: 19px;

        margin: 0 0 12px 0;

        padding-bottom: 6px;

        border-bottom:
          1px solid #cccccc;

        color: #222;

      }


      section p {

        margin: 0;

        font-size: 14px;

        line-height: 1.65;

        color: #444;

      }


      .skills {

        display: flex;

        flex-wrap: wrap;

        gap: 8px;

      }


      .skill {

        display: inline-block;

        padding: 7px 11px;

        background: #eeeeee;

        border:
          1px solid #d5d5d5;

        border-radius: 5px;

        font-size: 13px;

        color: #333;

      }


      .red {

        font-size: 14px;

        margin-bottom: 8px;

        color: #444;

        word-break: break-word;

      }


      .red strong {

        color: #222;

      }

    `;

  }


  // ==========================================
  // GENERAR VISTA PREVIA DEL CV GENERADO
  // ==========================================

  async generarVistaPreviaCV(): Promise<void> {

    if (
      !isPlatformBrowser(this.platformId)
    ) {

      return;

    }


    try {

      /*
       * Generamos el PDF automáticamente
       * utilizando los datos actuales del perfil.
       */

      const blob =
        await this.generarPDFComoBlob();


      /*
       * Liberar una vista previa generada
       * anteriormente.
       */

      if (
        this.cvPreviewGeneradoUrl
      ) {

        try {

          URL.revokeObjectURL(
            this.cvPreviewGeneradoUrl
          );

        } catch {

          // No hacer nada

        }

      }


      /*
       * Crear nueva URL temporal.
       */

      const url =
        URL.createObjectURL(blob);


      this.cvPreviewGeneradoUrl =
        url;


      this.cvPreviewUrl =
        url;


      this.mostrarVistaPreviaCV =
        true;

    } catch (error) {

      console.error(
        'Error generando vista previa:',
        error
      );


      alert(
        'No se pudo generar la vista previa del CV.'
      );

    }

  }


  // ==========================================
  // GENERAR Y DESCARGAR CV
  // ==========================================

  async descargarCV(): Promise<void> {

    await this.generarYDescargarCV();

  }


  async generarYDescargarCV(): Promise<void> {

    if (
      !isPlatformBrowser(this.platformId)
    ) {

      return;

    }


    try {

      const blob =
        await this.generarPDFComoBlob();


      const url =
        URL.createObjectURL(blob);


      const enlace =
        document.createElement('a');


      enlace.href =
        url;


      enlace.download =
        this.obtenerNombreArchivoCV();


      document.body.appendChild(
        enlace
      );


      enlace.click();


      document.body.removeChild(
        enlace
      );


      /*
       * Liberar URL temporal.
       */

      setTimeout(() => {

        URL.revokeObjectURL(url);

      }, 1000);


      this.mensajeEstado =
        '¡CV generado y descargado correctamente!';


      setTimeout(() => {

        this.mensajeEstado =
          null;

      }, 4000);

    } catch (error) {

      console.error(
        'Error generando CV:',
        error
      );


      alert(
        'No se pudo generar el PDF.'
      );

    }

  }


  // ==========================================
  // GENERAR PDF COMO BLOB
  // ==========================================

  private async generarPDFComoBlob(): Promise<Blob> {

    /*
     * Crear contenedor temporal.
     */

    const elemento =
      document.createElement('div');


    elemento.innerHTML =
      this.crearContenidoCV();


    /*
     * Aplicar estilos generales.
     */

    elemento.style.position =
      'absolute';

    elemento.style.left =
      '-10000px';

    elemento.style.top =
      '0';

    elemento.style.width =
      '794px';

    elemento.style.background =
      'white';

    elemento.style.fontFamily =
      'Arial, Helvetica, sans-serif';


    /*
     * Agregar CSS.
     */

    const estilos =
      document.createElement('style');


    estilos.innerHTML =
      this.obtenerEstilosCV();


    elemento.prepend(
      estilos
    );


    document.body.appendChild(
      elemento
    );


    try {

      /*
       * Esperar un momento para que
       * el navegador renderice correctamente.
       */

      await new Promise(resolve =>
        setTimeout(resolve, 100)
      );


      /*
       * Convertir HTML a imagen.
       */

      const canvas =
        await html2canvas(
          elemento,
          {

            scale: 2,

            useCORS: true,

            backgroundColor:
              '#ffffff',

            logging: false

          }
        );


      const imgData =
        canvas.toDataURL(
          'image/png'
        );


      /*
       * Crear PDF A4.
       */

      const pdf =
        new jsPDF(
          'p',
          'mm',
          'a4'
        );


      const anchoPDF =
        210;


      const altoPDF =
        297;


      const altoImagen =
        (
          canvas.height *
          anchoPDF
        ) /
        canvas.width;


      /*
       * Si entra en una sola página.
       */

      if (
        altoImagen <=
        altoPDF
      ) {

        pdf.addImage(

          imgData,

          'PNG',

          0,

          0,

          anchoPDF,

          altoImagen

        );

      } else {

        /*
         * Documento de varias páginas.
         */

        let alturaRestante =
          altoImagen;

        let posicionY =
          0;


        pdf.addImage(

          imgData,

          'PNG',

          0,

          posicionY,

          anchoPDF,

          altoImagen

        );


        alturaRestante -=
          altoPDF;


        while (
          alturaRestante > 0
        ) {

          posicionY -=
            altoPDF;


          pdf.addPage();


          pdf.addImage(

            imgData,

            'PNG',

            0,

            posicionY,

            anchoPDF,

            altoImagen

          );


          alturaRestante -=
            altoPDF;

        }

      }


      /*
       * Devolver como Blob.
       */

      return pdf.output(
        'blob'
      );

    } finally {

      /*
       * Eliminar elemento temporal.
       */

      if (
        elemento.parentNode
      ) {

        elemento.parentNode.removeChild(
          elemento
        );

      }

    }

  }


  // ==========================================
  // NOMBRE DEL ARCHIVO
  // ==========================================

  private obtenerNombreArchivoCV(): string {

    const nombre =
      this.perfil.nombres ||
      'Postulante';


    const apellido =
      this.perfil.apellidos ||
      '';


    const nombreCompleto =
      `${nombre}_${apellido}`
        .trim()
        .replace(/\s+/g, '_');


    return `CV_${nombreCompleto}.pdf`;

  }


  // ==========================================
  // UBICACIÓN
  // ==========================================

  guardarUbicacion(): void {

    this.perfil.ciudad =
      this.tempUbicacion.ciudad;


    this.perfil.pais =
      this.tempUbicacion.pais;


    this.guardarCambiosEnBackend();


    this.cerrarModal();

  }


  // ==========================================
  // SOBRE MÍ
  // ==========================================

  guardarSobreMi(): void {

    this.perfil.sobre_mi =
      this.tempSobreMi.sobre_mi;


    this.perfil.especialidad =
      this.tempSobreMi.especialidad;


    this.perfil.estado_academico =
      this.tempSobreMi.estado_academico;


    this.guardarCambiosEnBackend();


    this.cerrarModal();

  }


  // ==========================================
  // SKILLS FILTRADAS
  // ==========================================

  get categoriasFiltradas():
    CategoriaSkillDTO[] {

    const query =
      this.busquedaSkill
        .toLowerCase()
        .trim();


    if (!query) {

      return this.categoriasSkills;

    }


    return this.categoriasSkills

      .map(cat => ({

        ...cat,

        skills:
          cat.skills.filter(
            s =>
              s.nombre
                .toLowerCase()
                .includes(query)
          )

      }))

      .filter(
        cat =>
          cat.skills.length > 0
      );

  }


  // ==========================================
  // VERIFICAR SKILL SELECCIONADA
  // ==========================================

  esSkillSeleccionada(
    skill_id: number
  ): boolean {

    return this.tempSkillsIds
      .includes(skill_id);

  }


  // ==========================================
  // SELECCIONAR / QUITAR SKILL
  // ==========================================

  toggleSkill(
    skill_id: number
  ): void {

    const index =
      this.tempSkillsIds
        .indexOf(skill_id);


    if (
      index > -1
    ) {

      this.tempSkillsIds
        .splice(index, 1);

    } else {

      this.tempSkillsIds
        .push(skill_id);

    }

  }


  // ==========================================
  // GUARDAR SKILLS
  // ==========================================

  guardarSkills(): void {

    const todas =
      this.categoriasSkills
        .flatMap(
          c => c.skills
        );


    this.perfil.skills =
      todas.filter(
        s =>
          this.tempSkillsIds
            .includes(
              s.skill_id
            )
      );


    this.perfil.otras_habilidades =
      this.tempOtrasHabilidades;


    this.guardarCambiosEnBackend();


    this.cerrarModal();

  }


  // ==========================================
  // GUARDAR REDES
  // ==========================================

  guardarRedes(): void {

    this.perfil.redes = {

      ...this.tempRedes

    };


    this.guardarCambiosEnBackend();


    this.cerrarModal();

  }

}