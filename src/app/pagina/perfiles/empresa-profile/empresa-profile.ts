import { Component, OnInit } from '@angular/core';

interface PerfilEmpresa {
  // Datos obligatorios que vendrían del registro/login
  razonSocial: string; 
  nombreFantasia?: string;
  // Datos que la empresa completa
  ciudad: string;
  provincia: string;
  rubro: string;
  modalidad: string; // Remoto, Híbrido, Presencial
  sobreNosotros: string;
  techStack: string[]; // Tecnologías que usan en la empresa
  sitioWeb: string;
  linkedin: string;
}
@Component({
  selector: 'app-empresa-profile',
  standalone: true,
  imports: [],
  templateUrl: './empresa-profile.html',
  styleUrl: './empresa-profile.scss',
})
export class EmpresaProfile {
  perfil!: PerfilEmpresa;

  ngOnInit(): void {
    this.obtenerDatosEmpresa();
  }

  obtenerDatosEmpresa(): void {
    // Simulamos los datos que vienen del backend
    this.perfil = {
      nombreFantasia: 'TechMind Solutions',
      razonSocial: 'TechMind S.A.',
      ciudad: 'CABA',
      provincia: 'Buenos Aires',
      rubro: 'Desarrollo de Software & IA',
      modalidad: 'Híbrido (2 días de oficina)',
      sobreNosotros: 'Somos una startup enfocada en automatización de procesos utilizando modelos de Inteligencia Artificial y arquitecturas escalables en la nube.',
      techStack: ['Python', 'TensorFlow', 'Node.js', 'React', 'PostgreSQL', 'AWS'],
      sitioWeb: 'https://techmind.example.com',
      linkedin: 'https://linkedin.com/company/techmind'
    };
  }

  // Métodos para los botones de edición de la empresa
  editarDatosPrincipales() { console.log('Editar nombre, rubro, ubicación...'); }
  editarSobreNosotros() { console.log('Editar Sobre Nosotros...'); }
  editarTechStack() { console.log('Editar tecnologías de la empresa...'); }
  editarEnlaces() { console.log('Editar web y redes...'); }
}

