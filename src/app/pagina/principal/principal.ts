import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Estadistica {
  valor: string;
  label: string;
}

interface Paso {
  icono: string; // clase de FontAwesome, ej: 'fa-user-plus'
  titulo: string;
  descripcion: string;
}

interface OfertaDestacada {
  id: string;
  titulo: string;
  empresa: string;
  tecnologias: string[];
}

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})

export class Principal {
  // ============ ESTADÍSTICAS ============
  estadisticas: Estadistica[] = [
    { valor: '45+', label: 'Ofertas Publicadas' },
    { valor: '20+', label: 'Empresas Registradas' },
    { valor: '150+', label: 'Postulantes Activos' },
    { valor: '30+', label: 'Postulaciones Exitosas' },
  ];

  // ============ CÓMO FUNCIONA ============
  pasos: Paso[] = [
    {
      icono: 'fa-user-pen',
      titulo: 'Creá tu perfil',
      descripcion: 'Cargá tus habilidades, estudios y links a tu portfolio en pocos minutos.',
      
    },
    {
      icono: 'fa-magnifying-glass',
      titulo: 'Postulate a ofertas',
      descripcion: 'Explorá oportunidades filtradas por tecnología, empresa o modalidad.',
      
    },
    {
      icono: 'fa-handshake',
      titulo: 'Conectá con empresas',
      descripcion: 'Las empresas revisan tu perfil y te contactan directamente.',
      
    },
  ];

  // ============ OFERTAS DESTACADAS ============
  // Dejalas hardcodeadas para la demo si todavía no tenés el service conectado.
  ofertasDestacadas: OfertaDestacada[] = [
    {
      id: 'of-1',
      titulo: 'Desarrollador/a Frontend Angular Jr.',
      empresa: 'TechMind Solutions',
      tecnologias: ['Angular', 'TypeScript', 'CSS'],
    },
    {
      id: 'of-2',
      titulo: 'Analista de Sistemas — Soporte y Desarrollo',
      empresa: 'NovaSoft',
      tecnologias: ['.NET', 'SQL Server'],
    },
  ];

  // ============ FAQ (tu código original, sin tocar) ============
  faqs = [
    {
      pregunta: '¿Cómo me registro en la plataforma?',
      respuesta: 'Es súper fácil. Hacés clic en el botón de Registrarse, seleccionás la opción de Estudiante/Egresado, completás tus datos (Importante: tu número de Legajo del ITB), correo y contraseña entre otros y listo. Ya podés Loguearte armar tu perfil.',
      abierta: false
    },
    {
      pregunta: '¿Tiene algún costo el uso del sistema?',
      respuesta: 'No tiene costo. ITB Conecta es una herramienta de intermediación laboral completamente gratuita tanto para estudiantes de tercer año de las carreras como para los egresados de la institución.',
      abierta: false
    },
    {
      pregunta: 'Soy una empresa, ¿cómo puedo publicar ofertas?',
      respuesta: 'Al registrarte como Empresa, nuestro equipo validará tu perfil institucional. Una vez aprobado, vas a tener un panel exclusivo para subir y gestionar tus vacantes.',
      abierta: false
    }
  ];

  // Función para alternar el desplegable
  toggleFaq(index: number): void {
    this.faqs[index].abierta = !this.faqs[index].abierta;
  }
}