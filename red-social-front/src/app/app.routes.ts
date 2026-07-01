import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./pages/posts/posts').then((m) => m.Posts),
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/my-profile/my-profile').then((m) => m.MyProfile),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];