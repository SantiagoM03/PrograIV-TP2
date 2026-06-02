import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators,} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login 
{
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginError = '';

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
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
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

    const { usuarioOCorreo, password } = this.loginForm.getRawValue();

    if (usuarioOCorreo && password) 
    {
      const fakeUser = {
        nombre: 'Valentín',
        apellido: 'Suetta',
        correo: 'valen@mail.com',
        nombreUsuario: usuarioOCorreo,
        fechaNacimiento: '2000-01-01',
        descripcionBreve: 'Usuario de prueba para Sprint 1.',
        perfil: 'usuario',
        imagenPerfil: '',
      };

      localStorage.setItem('currentUser', JSON.stringify(fakeUser));
      this.router.navigateByUrl('/publicaciones');
      return;
    }

    this.loginError = 'No pudimos iniciar sesión. Revisá los datos ingresados.';
  }
}