import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Oferta, OfertaService } from '../../services/oferta_service';

interface Estadistica {
  valor: string;
  label: string;
}

interface Paso {
  icono: string;
  titulo: string;
  descripcion: string;
}

interface OfertaDestacada {
  id: string | number;
  titulo: string;
  empresa: string;
  tecnologias: string[];
}

interface FaqItem {
  pregunta: string;
  respuesta: string;
  abierta: boolean;
}

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal implements OnInit {
  private ofertaService = inject(OfertaService);
  private cdr = inject(ChangeDetectorRef);

  cargandoOfertas: boolean = true;
  ofertasDestacadas: OfertaDestacada[] = [];

  estadisticas: Estadistica[] = [
    { valor: '45+', label: 'Ofertas Publicadas' },
    { valor: '20+', label: 'Empresas Registradas' },
    { valor: '150+', label: 'Postulantes Activos' },
    { valor: '30+', label: 'Postulaciones Exitosas' },
  ];

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

  faqs: FaqItem[] = [
    {
      pregunta: '¿Cómo me registro en la plataforma?',
      respuesta: 'Es súper fácil. Hacés clic en el botón de Registrarse, seleccionás la opción de Estudiante/Egresado, completás tus datos (Importante: tu número de Legajo del ITB), correo y contraseña entre otros y listo. Ya podés Loguearte armar tu perfil.',
      abierta: false,
    },
    {
      pregunta: '¿Tiene algún costo el uso del sistema?',
      respuesta: 'No tiene costo. ITB Conecta es una herramienta de intermediación laboral completamente gratuita tanto para estudiantes de tercer año de las carreras como para los egresados de la institución.',
      abierta: false,
    },
    {
      pregunta: 'Soy una empresa, ¿cómo puedo publicar ofertas?',
      respuesta: 'Al registrarte como Empresa, nuestro equipo validará tu perfil institucional. Una vez approved, vas a tener un panel exclusivo para subir y gestionar tus vacantes.',
      abierta: false,
    },
  ];

  ngOnInit(): void {
    this.cargarOfertasDestacadas();
  }

  cargarOfertasDestacadas(): void {
    this.cargandoOfertas = true;

    this.ofertaService.getOfertasVigentes().subscribe({
      next: (ofertas: any[]) => {
        console.log('Ofertas recibidas de la API:', ofertas);

        if (Array.isArray(ofertas) && ofertas.length > 0) {
          // Tomamos únicamente las primeras 3 ofertas (más recientes)
          this.ofertasDestacadas = ofertas.slice(0, 3).map((of, index) => {
            let techs: string[] = [];

            if (Array.isArray(of.skills_nombres)) {
              techs = of.skills_nombres;
            } else if (typeof of.skills_nombres_str === 'string' && of.skills_nombres_str.trim() !== '') {
              techs = of.skills_nombres_str.split(',');
            } else if (Array.isArray(of.tecnologias)) {
              techs = of.tecnologias;
            }

            return {
              id: of.id_oferta ?? of.id ?? (index + 1),
              titulo: of.titulo || 'Sin título especificado',
              empresa: of.razonSocial || of.empresa || 'Empresa Registrada',
              tecnologias: techs,
            };
          });
        } else {
          this.ofertasDestacadas = [];
        }

        this.cargandoOfertas = false;
        this.cdr.detectChanges(); // Forzamos el renderizado de la vista
      },
      error: (err) => {
        console.error('Error al conectar con la API de ofertas:', err);
        this.cargandoOfertas = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleFaq(index: number): void {
    this.faqs[index].abierta = !this.faqs[index].abierta;
  }
}