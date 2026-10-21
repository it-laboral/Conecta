import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restablecer.html',
  styleUrl: './restablecer.scss'
})
export class Restablecer implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  token: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  cargando: boolean = false;

  // Regex: mín 8 chars, 1 mayúscula, 1 número y 1 carácter especial
  private passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  formulario: FormGroup = this.fb.group({
    nuevaPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
    confirmarPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.mensajeError = 'El token de recuperación no es válido o se encuentra ausente.';
    }
  }

  // Getter conveniente para acceder fácilmente a los controles en el HTML
  get f() {
    return this.formulario.controls;
  }

  cambiarPassword(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nuevaPassword, confirmarPassword } = this.formulario.value;

    if (nuevaPassword !== confirmarPassword) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.authService.restablecerPassword(this.token, nuevaPassword).subscribe({
      next: (res) => {
        if (res.success) {
          this.mensajeExito = res.message;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.mensajeError = res.message;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al procesar la solicitud.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}