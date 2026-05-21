import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import path from 'node:path';
import { Principal } from './pagina/principal/principal';
import { RegistrarPostulante } from './pagina/registrar/registrar-postulante/registrar-postulante';
import { Ofertas } from './pagina/ofertas/ofertas';
import { Sesion } from './pagina/sesion/sesion';
import { RegistrarHome } from './pagina/registrar/registrar-home/registrar-home';
import { RegistrarEmpresa } from './pagina/registrar/registrar-empresa/registrar-empresa';
import { EmpresaProfile } from './pagina/perfiles/empresa-profile/empresa-profile';
import { PostulanteProfile } from './pagina/perfiles/postulante-profile/postulante-profile';


export const routes: Routes = [
  { path: '', component: Principal },
  { path: 'registrar', component: RegistrarHome },
  { path: 'registrar-postulante', component: RegistrarPostulante },
  { path: 'registrar-empresa', component: RegistrarEmpresa },
  { path: 'ofertas', component: Ofertas },
  { path: 'sesion', component: Sesion },

  { path: 'perfil-empresa', component: EmpresaProfile },
  { path: 'perfil-postulante', component: PostulanteProfile },

  { path: '**', redirectTo: '' }
  
];
