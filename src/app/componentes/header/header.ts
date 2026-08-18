import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public authService = inject(AuthService);
  private router= inject(Router);

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/sesion']);
  }


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
