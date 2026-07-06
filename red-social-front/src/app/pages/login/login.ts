import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

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

    /*
      En login NO valido patrón de contraseña.

      Motivo:
      - No quiero filtrar reglas de seguridad.
      - Si la contraseña está mal, el backend responde:
        "Credenciales inválidas."
    */
    password: [
      '',
      [
        Validators.required,
      ],
    ],
  });

  get usuarioOCorreo() {
    return this.loginForm.get('usuarioOCorreo');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login(): void 
  {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.getRawValue();

    const loginData: LoginRequest = {
      usuarioOCorreo: formValue.usuarioOCorreo!.trim(),
      password: formValue.password!,
    };

    this.isLoading = true;

    this.authService
      .login(loginData)
      .pipe(
        /*
          finalize se me ejecuta siempre:
          - si el login sale bien;
          - si el backend devuelve 401;
          - si ocurre otro error.

          Así evito que el botón quede clavado en "Ingresando...".
        */
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/publicaciones');
        },
        error: (error: Error) => {
          this.loginError = error.message;
        },
      });
  }
}