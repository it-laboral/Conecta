import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],

  templateUrl: './registrar.html',
  styleUrl: './registrar.scss',
})

export class Registrar {

  private authService = inject(AuthService);
  private router = inject(Router);

  tipoUsuario: string = 'postulante';

  formRegistro = new FormGroup({

    nombre: new FormControl('', [
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

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    carrera: new FormControl(''),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])

  });

  registrarUsuario() {

    if (this.formRegistro.valid) {

      const datos = this.formRegistro.value;

      this.authService.registrarPostulante(datos).subscribe({

        next: (res: any) => {

          console.log('¡Usuario creado con éxito!', res);

          alert('Usuario registrado correctamente');

          this.router.navigate(['/login']);

        },

        error: (err: any) => {

          console.error('Error al registrar:', err);

          alert('Hubo un error al crear la cuenta');

        }

      });

    } else {

      alert('Complete correctamente todos los campos');

    }

  }

}