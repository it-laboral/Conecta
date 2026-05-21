import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service'; // Importamos el servicio
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registrar-postulante',
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './registrar-postulante.html',
  styleUrl: './registrar-postulante.scss',
})
export class RegistrarPostulante {
  private authService = inject(AuthService);
  private router = inject(Router);

  formRegistro = new FormGroup({
    nombres: new FormControl('', [Validators.required, Validators.minLength(3)]),
    apellidos: new FormControl('',[Validators.required]),
    dni: new FormControl('',[
      Validators.required, Validators.pattern("^[0-9]*$"),
      Validators.minLength(7), Validators.maxLength(8)]),
    legajo: new FormControl('',[Validators.required]),
    carrera: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]), 
  });

  registrarPostulante() {
    if (this.formRegistro.valid) {
      const datos = this.formRegistro.value;
      
     this.authService.registrarPostulante(datos).subscribe({
        next: (res) => {
          console.log('¡Postulante creado con éxito!', res);
          alert('¡Registro exitoso! Ya puedes iniciar sesión.'); // Un mensaje más amigable
          this.router.navigate(['/sesion']); // Lo mandamos al login automáticamente
        },
        error: (err) => {
        console.error('Error detallado desde el servidor:', err);
        
        // Si el backend te manda un mensaje específico (como "El email ya está registrado") lo mostramos
        const mensajeError = err.error?.message || 'Hubo un error al crear la cuenta';
        alert(mensajeError); 
      }
    });
  } else {
    alert('Por favor, completa todos los campos obligatorios correctamente.');
  }
}
}