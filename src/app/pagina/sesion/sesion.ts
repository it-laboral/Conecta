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
  // Inyectamos las herramientas necesarias
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  ingresar() {
    if (this.loginForm.valid) {
      const credenciales = this.loginForm.value;
      console.log('Enviando datos al servidor:', credenciales.email);

      // LLAMADA REAL AL BACKEND
      this.authService.login(credenciales).subscribe({
        next: (res) => {
        console.log('¡Éxito! Respuesta completa del servidor:', res);
        let saludo = 'Usuario';
    
      if (res.tipo === 'postulante') {
      saludo = 'Postulante';
      } else if (res.tipo === 'empresa') {
      saludo = 'Empresa';
      }

      // El alert ahora mostrará: "¡Bienvenido/a Postulante!" o "¡Bienvenido/a Empresa!"
      alert(`¡Bienvenido/a ${saludo}!`);
          this.router.navigate(['/principal']); 
        },
        error: (err) => {
          console.error('Error en el login:', err);
          // Si el servidor mandó un mensaje de error, lo mostramos
          alert('Error: ' + (err.error.message || 'No se pudo iniciar sesión'));
        }
      });
    } else {
      alert('Por favor, completa los campos correctamente.');
    }
  }
}
