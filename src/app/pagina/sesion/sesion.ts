import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sesion',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sesion.html',
  styleUrl: './sesion.scss',
})
export class Sesion {

  // SERVICIOS
  private authService = inject(AuthService);
  private router = inject(Router);

  // MOSTRAR / OCULTAR PASSWORD
  mostrarPassword = false;

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // FORMULARIO
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ])
  });

  // LOGIN
  ingresar() {
    if (this.loginForm.valid) {
      const credenciales = this.loginForm.value;

      console.log('Enviando datos al servidor:', credenciales.email);

      this.authService.login(credenciales).subscribe({
        next: (res: any) => {
          console.log('¡Éxito! Respuesta completa del servidor:', res);

          if (res.success) {
            // 1. GUARDAR EN LOCALSTORAGE
            localStorage.setItem('token', res.token);
            localStorage.setItem('tipo', res.tipo);
            localStorage.setItem('user', JSON.stringify(res.user));

            // 2. REDIRECCIÓN SEGÚN EL ROL DE USUARIO
            if (res.tipo === 'admin') {
              alert('¡Bienvenido/a Administrador/a!');
              this.router.navigate(['/panel-admin']);
            } 
            else if (res.tipo === 'empresa') {
              alert('¡Bienvenida Empresa!');
              this.router.navigate(['/perfil/empresa']);
            } 
            else if (res.tipo === 'postulante') {
              alert('¡Bienvenido/a Postulante!');
              this.router.navigate(['/ofertas']);
            } 
            else {
              alert('¡Bienvenido/a!');
              this.router.navigate(['/']);
            }
          }
        },

        error: (err) => {
          console.error('Error en el login:', err);
          alert(
            'Error: ' +
            (err.error?.message || 'No se pudo iniciar sesión')
          );
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completa los campos correctamente.');
    }
  }
}