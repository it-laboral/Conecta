import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CARRERAS_ITB } from '../../../constants/carreras';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registrar-postulante',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './registrar-postulante.html',
  styleUrl: './registrar-postulante.scss',
})
export class RegistrarPostulante implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  carrerasDisponibles = CARRERAS_ITB;
  
  // MOSTRAR / OCULTAR PASSWORD
  mostrarPassword = false;

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // FORMULARIO
  formRegistro = new FormGroup({

    nombres: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),

    apellidos: new FormControl('', [
      Validators.required
    ]),

    dni: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]*$"),
      Validators.minLength(7),
      Validators.maxLength(8)
    ]),

    legajo: new FormControl('', [
      Validators.required
    ]),

    carrera: new FormControl('', [
      Validators.required
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]),

    confirmPassword: new FormControl('', [
      Validators.required
    ])

  });

  // LIMPIAR FORMULARIO AL CARGAR LA PÁGINA
  ngOnInit(): void {
    this.formRegistro.reset();
  }

  // REGISTRAR POSTULANTE
  registrarPostulante() {

    if (
      this.formRegistro.value.password !==
      this.formRegistro.value.confirmPassword
    ) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.formRegistro.valid) {

      const datos = this.formRegistro.value;

      this.authService.registrarPostulante(datos).subscribe({

        next: (res) => {

          console.log('¡Postulante creado con éxito!', res);

          alert('Registro exitoso.');

          // Resetear el formulario tras enviar
          this.formRegistro.reset();

          this.router.navigate(['/sesion']);

        },

        error: (err) => {

          console.error('Error detallado desde el servidor:', err);

          const mensajeError =
            err.error?.message ||
            'Hubo un error al crear la cuenta';

          alert(mensajeError);

        }

      });

    }

    else {

      this.formRegistro.markAllAsTouched();

      alert('Por favor, completa todos los campos obligatorios correctamente.');

    }

  }

}