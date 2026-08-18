import { Routes } from '@angular/router';
import { Principal } from './pagina/principal/principal';
import { RegistrarPostulante } from './pagina/registrar/registrar-postulante/registrar-postulante';
import { Ofertas } from './pagina/ofertas/ofertas';
import { Sesion } from './pagina/sesion/sesion';
import { RegistrarEmpresa } from './pagina/registrar/registrar-empresa/registrar-empresa';
import { RegistrarHome } from './pagina/registrar/registrar-home/registrar-home';
import { PanelAdmin } from './pagina/panel-admin/panel-admin';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Principal },
  { path: 'registrar', component: RegistrarHome },
  { path: 'registrar-postulante', component: RegistrarPostulante },
  { path: 'registrar-empresa', component: RegistrarEmpresa },
  { path: 'ofertas', component: Ofertas },
  { path: 'sesion', component: Sesion },

  { path: 'panel-admin', component: PanelAdmin, canActivate: [adminGuard] },  // 👈 Guarda asignado aquí

  

  {path: 'perfil', // Esto es lo que se verá en la URL
    loadComponent: () => import('./pagina/perfiles/sidebar/sidebar').then(m => m.Sidebar), // Ojo aquí: tu clase se llama 'Sidebar' (sin Component al final)
    children: [
      {
        path: 'postulante',
        loadComponent: () => import('./pagina/perfiles/postulante-profile/postulante-profile').then(m => m.PostulanteProfile)
      },
      {
        path: 'empresa',
        loadComponent: () => import('./pagina/perfiles/empresa-profile/empresa-profile').then(m => m.EmpresaProfile)
      },
      { path: '', redirectTo: 'postulante', pathMatch: 'full' } // Si entran a /perfil, van por defecto a postulante
    ]
  },
  { path: '**', redirectTo: '' }
  
];
