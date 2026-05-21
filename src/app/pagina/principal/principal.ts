import { Component } from '@angular/core';

@Component({
  selector: 'app-principal',
  imports: [],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal {
  
  // Datos simulados (Mock Data)
  ofertasDestacadas = [
    {
      id: 1,
      puesto: 'Desarrollador Angular Junior',
      empresa: 'Tech Solutions',
      ubicacion: 'Remoto',
      salario: '$850.000'
    },
    {
      id: 2,
      puesto: 'Analista de Sistemas',
      empresa: 'Banco Institucional',
      ubicacion: 'Buenos Aires',
      salario: 'A convenir'
    },
    {
      id: 3,
      puesto: 'Soporte Técnico IT',
      empresa: 'Conectar Global',
      ubicacion: 'Híbrido',
      salario: '$980.000'
    }
  ];
  
}

