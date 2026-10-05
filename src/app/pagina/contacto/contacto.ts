import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
    }).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.nombre = this.email = this.mensaje = '';
      },
      error: (err) => {
        this.enviando = false;
        this.error = err.error?.error || 'Ocurrió un error. Intentá de nuevo.';
      }
    });
  }
}