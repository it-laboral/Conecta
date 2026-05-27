import { Component, inject } from '@angular/core';

import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

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

      // MINIMO 8 CARACTERES
      Validators.minLength(8),

      // 1 MAYUSCULA + 1 NUMERO
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)

    ])

  });

  // LOGIN
  ingresar() {

    if (this.loginForm.valid) {

      const credenciales = this.loginForm.value;

      console.log(
        'Enviando datos al servidor:',
        credenciales.email
      );

      this.authService.login(credenciales).subscribe({

        next: (res) => {

          console.log(
            '¡Éxito! Respuesta completa del servidor:',
            res
          );

          let saludo = 'Usuario';

          if (res.tipo === 'postulante') {
            saludo = 'Postulante';
          }

          else if (res.tipo === 'empresa') {
            saludo = 'Empresa';
          }

          alert(`¡Bienvenido/a ${saludo}!`);

          this.router.navigate(['/principal']);

        },

        error: (err) => {

          console.error('Error en el login:', err);

          alert(
            'Error: ' +
            (err.error.message || 'No se pudo iniciar sesión')
          );

        }

      });

    }

    else {

      this.loginForm.markAllAsTouched();

      alert(
        'Por favor, completa los campos correctamente.'
      );

    }

  }

}