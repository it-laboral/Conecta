import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  esPostulante: boolean = false;
  esEmpresa: boolean = false;
  esAdmin: boolean = false;

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    // Lee directamente tipoUsuario
    const tipo = (this.authService.getTipoUsuario() || '').toLowerCase();

    this.esPostulante = tipo === 'postulante';
    this.esEmpresa = tipo === 'empresa';
    this.esAdmin = tipo === 'admin';
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/sesion']);
  }
}