import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../services/alerta.service'; // Ajusta la ruta si está en otra carpeta

@Component({
  selector: 'app-custom-alerta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta.html',
  styleUrl: './alerta.scss'
})
export class Alerta {
  constructor(public alertaService: AlertaService) {}
}