import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    /*
      Sprint 3:
      Al iniciar la app desde la ruta raíz "/", mostramos una pantalla
      de cargando y validamos la sesión contra POST /api/auth/autorizar.

      Como el backend responde muy rápido, dejamos el spinner visible
      al menos 1 segundo para que se note.
    */
    const minimumLoadingTime = 1000;
    const startedAt = Date.now();

    this.authService.authorize().subscribe({
      next: () => {
        const elapsed = Date.now() - startedAt;
        const remainingTime = Math.max(minimumLoadingTime - elapsed, 0);

        setTimeout(() => {
          this.router.navigateByUrl('/publicaciones');
        }, remainingTime);
      },
      error: () => {
        const elapsed = Date.now() - startedAt;
        const remainingTime = Math.max(minimumLoadingTime - elapsed, 0);

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, remainingTime);
      },
    });
  }
}