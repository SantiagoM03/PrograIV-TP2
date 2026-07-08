import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { adminGuard } from './guards/admin.guard';

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
    path: 'perfiles/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/public-profile/public-profile').then(
        (m) => m.PublicProfile,
      ),
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
    path: 'dashboard/usuarios',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/dashboard-users/dashboard-users').then(
        (m) => m.DashboardUsers,
      ),
  },
  {
    path: 'dashboard/estadisticas',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/dashboard-statistics/dashboard-statistics').then(
        (m) => m.DashboardStatistics,
      ),
  },
  {
    path: '**',
    redirectTo: 'publicaciones',
  },
];