import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Ajustá la ruta relativa si es necesario

@Component({
  selector: 'app-solicitar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './solicitar.html',
  styleUrl: './solicitar.scss'
})
export class Solicitar {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  cargando: boolean = false;

  enviarSolicitud(): void {
    if (!this.email) {
      this.mensajeError = 'Por favor, ingresá tu correo electrónico.';
      return;
    }

    this.cargando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.authService.solicitarRecupero(this.email).subscribe({
      next: (res) => {
        if (res.success) {
          this.mensajeExito = res.message;
        } else {
          this.mensajeError = res.message;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al solicitar recupero:', err);
        this.mensajeError = err.error?.message || 'Ocurrió un error al procesar la solicitud.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
