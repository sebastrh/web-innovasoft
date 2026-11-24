import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Login } from './login/login';
import { Admin } from './admin/admin';
import { Nosotros } from './nosotros/nosotros';
import { Servicios } from './servicios/servicios';
import { Publicaciones } from './publicaciones/publicaciones';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing, title: 'Marketing Manager | Agencia Digital' },
  { path: 'servicios', component: Servicios, title: 'Servicios | Marketing Manager' },
  { path: 'nosotros', component: Nosotros, title: 'Nosotros | Marketing Manager' },
  { path: 'publicaciones', component: Publicaciones, title: 'Publicaciones | Marketing Manager' },
  { path: 'contacto', redirectTo: '' },
  { path: 'gestion-interna', component: Login, title: 'Acceso Seguro | Marketing Manager' },
  { path: 'panel-interno', component: Admin, canActivate: [authGuard], title: 'Panel de Control | Marketing Manager' },
  { path: '**', redirectTo: '' }
];
