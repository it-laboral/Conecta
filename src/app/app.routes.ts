import { Routes } from '@angular/router';
 
// Componentes de Carga Directa (Eager)
import { Principal } from './pagina/principal/principal';
import { Sesion } from './pagina/sesion/sesion';
import { RegistrarHome } from './pagina/registrar/registrar-home/registrar-home';
import { RegistrarPostulante } from './pagina/registrar/registrar-postulante/registrar-postulante';
import { RegistrarEmpresa } from './pagina/registrar/registrar-empresa/registrar-empresa';
import { Ofertas } from './pagina/ofertas/ofertas';
import { PostulacionesComponent } from './pagina/postulaciones/postulaciones';
import { PanelAdmin } from './pagina/panel-admin/panel-admin';
import { Contacto } from './pagina/contacto/contacto';
 
// Guards de Seguridad y Roles
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { postulanteGuard } from './guards/postulante.guard';
import { empresaGuard } from './guards/empresa.guard';
 
export const routes: Routes = [
  // ===================================================
  // 1. RUTAS PÚBLICAS Y AUTENTICACIÓN
  // ===================================================
  { path: '', component: Principal },
  { path: 'sesion', component: Sesion },
  { path: 'registrar', component: RegistrarHome },
  { path: 'registrar-postulante', component: RegistrarPostulante },
  { path: 'registrar-empresa', component: RegistrarEmpresa },
 
  // Formulario de contacto (público)
  { path: 'contacto', component: Contacto },
 
  // Cartelera pública (lectura para todos)
  { path: 'ofertas', component: Ofertas },
 
 
// Mis publicaciones (Reutiliza Ofertas filtrando por la empresa logueada)
  { 
    path: 'mis-ofertas', 
    component: Ofertas, 
    canActivate: [empresaGuard] 
  },
  // ===================================================
  // 2. VISTAS PROTEGIDAS DE PERFILES INDIVIDUALES
  // ===================================================
  {
    path: 'empresa/:id',
    loadComponent: () =>
      import('./pagina/perfiles/empresa-profile/empresa-profile').then(m => m.EmpresaProfile),
    canActivate: [authGuard]
  },
  {
    path: 'postulante/:id',
    loadComponent: () =>
      import('./pagina/perfiles/postulante-profile/postulante-profile').then(m => m.PostulanteProfile),
    canActivate: [authGuard] 
  },
 
  // ===================================================
  // 3. RUTAS POR ROL ESPECÍFICO
  // ===================================================
  // Vista para el Postulante ("Mis Postulaciones")
  { 
    path: 'postulaciones', 
    component: PostulacionesComponent, 
    canActivate: [authGuard]
  },
 
  // Vista para la Empresa ("Candidatos de una Oferta concreta")
  { 
    path: 'postulaciones/oferta/:idOferta', 
    component: PostulacionesComponent, 
    canActivate: [authGuard]
  },
  
  { 
    path: 'panel-admin', 
    component: PanelAdmin, 
    canActivate: [adminGuard] 
  },
 
  // ===================================================
  // 4. EDICIÓN DE PERFILES Y PANEL (Layout con Sidebar)
  // ===================================================
  {
    path: 'perfil',
    loadComponent: () => 
      import('./pagina/perfiles/sidebar/sidebar').then(m => m.Sidebar),
    canActivate: [authGuard],
    children: [
      {
        path: 'postulante',
        loadComponent: () => 
          import('./pagina/perfiles/postulante-profile/postulante-profile').then(m => m.PostulanteProfile),
        canActivate: [postulanteGuard]
      },
      {
        path: 'curriculum',
        loadComponent: () => 
          import('./pagina/perfiles/curriculum/curriculum').then(m => m.Curriculum),
        canActivate: [postulanteGuard]
      },
      {
        path: 'empresa',
        loadComponent: () => 
          import('./pagina/perfiles/empresa-profile/empresa-profile').then(m => m.EmpresaProfile),
        canActivate: [empresaGuard]
      },
 
      // 👈 RUTAS DEL BUSCADOR INTEGRADAS AL SIDEBAR
      {
        path: 'empresas',
        loadComponent: () => 
          import('./pagina/buscador/buscador').then(m => m.Buscador)
      },
      {
        path: 'postulantes',
        loadComponent: () => 
          import('./pagina/buscador/buscador').then(m => m.Buscador)
      }
    ]
  },
 
  // ===================================================
  // 5. REDIRECCIÓN POR DEFECTO
  // ===================================================
  { path: '**', redirectTo: '' }
];
 