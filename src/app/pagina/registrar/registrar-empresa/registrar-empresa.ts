import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registrar-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registrar-empresa.html',
  styleUrl: './registrar-empresa.scss',
})
export class RegistrarEmpresa implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  mostrarPassword = false;

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  formRegistro = new FormGroup({
    razonSocial: new FormControl('', [Validators.required]),
    fantasia: new FormControl(''),
    organizacion: new FormControl('', [Validators.required]),
    cuit: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{2}-[0-9]{8}-[0-9]{1}$')]),
    sector: new FormControl('', [Validators.required]),
    pais: new FormControl('', [Validators.required]),
    provincia: new FormControl('', [Validators.required]),
    ciudad: new FormControl('', [Validators.required]),
    cp: new FormControl(''),
    calle: new FormControl('', [Validators.required]),
    numero: new FormControl(''),
    piso: new FormControl(''),
    dpto: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    web: new FormControl(''),
    telefono: new FormControl('', [Validators.required]),
    responsable: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.formRegistro.reset();
  }

  registrarEmpresa() {
    if (this.formRegistro.value.password !== this.formRegistro.value.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.formRegistro.valid) {
      this.authService.registrarEmpresa(this.formRegistro.value).subscribe({
        next: (res) => {
          console.log('¡Empresa registrada con éxito!', res);
          alert('¡Empresa registrada con éxito! Ya podés iniciar sesión.');
          this.formRegistro.reset();
          this.router.navigate(['/sesion']);
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          alert('Hubo un error al crear la cuenta');
        }
      });
    } else {
      this.formRegistro.markAllAsTouched();
      alert('Por favor, completá todos los campos correctamente.');
    }
  }
}