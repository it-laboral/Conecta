import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(private router: Router){}

irPerfil(){

  const tipo = localStorage.getItem('tipo');

  if(tipo === 'empresa'){

    this.router.navigate(['/perfil-empresa']);

  }else if(tipo === 'postulante'){

    this.router.navigate(['/perfil-postulante']);

  }else{

    this.router.navigate(['/sesion']);

  }

}
}
