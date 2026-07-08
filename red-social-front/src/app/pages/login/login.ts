import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService, LoginRequest } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  loginError = '';
  isLoading = false;

  loginForm = this.fb.group({
    usuarioOCorreo: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
      ],
    ],
  });

  ngOnInit(): void {
    /*
      Cuando entro al login, limpio cualquier usuario local viejo.

      Esto evita estados raros en la primera carga de la app:
      - localStorage con usuario viejo;
      - cookie vencida;
      - loading previo que redirigió al login.
    */
    this.authService.clearCurrentUser();

    this.loginError = '';
    this.isLoading = false;
  }

  get usuarioOCorreo() {
    return this.loginForm.get('usuarioOCorreo');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const formValue = this.loginForm.getRawValue();

    const credentials: LoginRequest = {
      usuarioOCorreo: formValue.usuarioOCorreo!.trim(),
      password: formValue.password!,
    };

    this.isLoading = true;
    this.loginForm.disable();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;

        /*
          Fuerzo una carga limpia de publicaciones.

          Esto corrige el problema de que después del login inicial
          publicaciones necesite refresh para ordenar, publicar o comentar.
        */
        window.location.replace(`${window.location.origin}/publicaciones`);
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.loginForm.enable();

        if (error instanceof Error) {
          this.loginError = error.message || 'Credenciales inválidas.';
        } else {
          this.loginError = 'Credenciales inválidas.';
        }

        /*
          Fuerzo actualización visual.

          Esto corrige el caso puntual de primera apertura de la app,
          donde el error llegaba pero la interfaz no se actualizaba.
        */
        this.cdr.detectChanges();
      },
    });
  }
}