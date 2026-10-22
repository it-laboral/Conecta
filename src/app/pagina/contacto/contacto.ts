import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {
  nombre = '';
  email = '';
  mensaje = '';
  enviando = false;
  exito = false;
  error = '';

  constructor(private http: HttpClient) {}

  enviar() {
    this.error = '';
    this.exito = false;
    this.enviando = true;

    this.http.post('http://localhost:3000/api/contacto', {
      nombre: this.nombre,
      email: this.email,
      mensaje: this.mensaje
    }).pipe(
      timeout(6000) // Si el servidor tarda más de 6 segundos, corta la petición
    ).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.nombre = this.email = this.mensaje = '';
        
        // --- El alert de éxito que querías ---
        alert('¡Mensaje enviado con éxito!');
      },
      error: (err) => {
        this.enviando = false;
        
        if (err.name === 'TimeoutError') {
          this.error = 'El servidor está tardando demasiado en responder. Intentá de nuevo.';
        } else {
          this.error = err.error?.error || 'Ocurrió un error. Intentá de nuevo.';
        }
      }
    });
  }
}