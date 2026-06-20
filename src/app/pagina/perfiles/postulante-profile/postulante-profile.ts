import { Component, OnInit } from '@angular/core';

interface Estudio {
  titulo: string;
  institucion: string;
  estado: string;
}

interface PerfilPostulante {
  // Estos datos vienen por defecto de la cuenta del postulante
  nombres: string;
  apellidos: string;
  
  // Todo lo demás lo va a ir cargando y editando el alumno
  ciudad: string;
  pais: string;
  sobreMi: string;
  estudios: Estudio[];
  skills: string[];
  redes: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
}

@Component({
  selector: 'app-postulante-profile',
  standalone: true,
  imports: [],
  templateUrl: './postulante-profile.html',
  styleUrls: ['./postulante-profile.scss'],
})
export class PostulanteProfile implements OnInit{
  perfil!: PerfilPostulante;

  ngOnInit(): void {
    this.obtenerDatosDelPostulante();
  }

  obtenerDatosDelPostulante(): void {
    // Simulamos que el sistema ya sabe quién inició sesión 
    // Trae "Nombres y Apellidos" obligatorios, y el resto si ya lo completó
    this.perfil = {
      nombres: 'Sofía',
      apellidos: 'Rodríguez',
      ciudad: 'Lanús',
      pais: 'Argentina',
      sobreMi: 'Estudiante avanzada de Análisis de Sistemas. Me interesa el desarrollo Frontend y las soluciones con Inteligencia Artificial.',
      estudios: [
        { titulo: 'Análisis de Sistemas', institucion: 'ITB', estado: 'En curso' }
      ],
      skills: ['Angular 21', 'TypeScript', 'Sass', 'SQL'],
      redes: {
        github: 'https://github.com/sofia',
        linkedin: 'https://linkedin.com/in/sofia',
        portfolio: 'https://sofia.dev'
      }
    };
  }

  // Funciones para los botones de editar (aquí meterán la lógica de formularios después)
  editarDatosPrincipales() {
    console.log('Abrir edición de nombre, ciudad, etc.');
  }

  editarSobreMi() {
    console.log('Abrir edición de Sobre Mí');
  }

  editarEstudios() {
    console.log('Abrir panel de estudios');
  }

  editarSkills() {
    console.log('Abrir selector de habilidades');
  }

  editarRedes() {
    console.log('Abrir edición de links');
  }
}
