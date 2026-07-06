import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Navbar } from './components/navbar/navbar';
import { SessionModal } from './components/session-modal/session-modal';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SessionModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showSessionModal = this.authService.showSessionModal;

  extendSession(): void 
  {
    this.authService.refreshSession().subscribe({
      next: () => {
        this.authService.hideSessionModal();
      },
      error: () => {
        this.authService.clearCurrentUser();
        this.router.navigateByUrl('/login');
      },
    });
  }

  logoutFromModal(): void 
  {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authService.clearCurrentUser();
        this.router.navigateByUrl('/login');
      },
    });
  }
}