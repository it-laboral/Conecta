import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal {
  
  constructor() {}

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
  