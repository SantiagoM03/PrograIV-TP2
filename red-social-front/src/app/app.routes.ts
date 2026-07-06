import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/loading/loading').then((m) => m.Loading),
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'publicaciones/:id',
    loadComponent: () =>
      import('./pages/post-detail/post-detail').then((m) => m.PostDetail),
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./pages/posts/posts').then((m) => m.Posts),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-profile/my-profile').then((m) => m.MyProfile),
  },
  {
    path: '**',
    redirectTo: 'publicaciones',
  },
];