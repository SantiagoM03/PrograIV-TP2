import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,} from '@angular/forms';
import { User, UserProfile } from '../../models/user';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function passwordsMatchValidator(): ValidatorFn 
{
  return (control: AbstractControl): ValidationErrors | null => 
  {
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;

    if (!password || !repetirPassword) {
      return null;
    }

    return password === repetirPassword ? null : { passwordsMismatch: true };
  };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})

export class Register 
{
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerError = '';
  registerSuccess = '';
  selectedImageName = '';
  imagePreview = '';

  registerForm = this.fb.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(40),
        ],
      ],
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(40),
        ],
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z0-9._]+$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(passwordRegex),
        ],
      ],
      repetirPassword: [
        '',
        [
          Validators.required,
        ],
      ],
      fechaNacimiento: [
        '',
        [
          Validators.required,
        ],
      ],
      descripcionBreve: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(180),
        ],
      ],
      imagenPerfil: [
        '',
        [
          Validators.required,
        ],
      ],
      perfil: [
        'usuario' as UserProfile,
        [
          Validators.required,
        ],
      ],
    },
    {
      validators: passwordsMatchValidator(),
    }
  );

  get nombre() {
    return this.registerForm.get('nombre');
  }

  get apellido() {
    return this.registerForm.get('apellido');
  }

  get correo() {
    return this.registerForm.get('correo');
  }

  get nombreUsuario() {
    return this.registerForm.get('nombreUsuario');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get repetirPassword() {
    return this.registerForm.get('repetirPassword');
  }

  get fechaNacimiento() {
    return this.registerForm.get('fechaNacimiento');
  }

  get descripcionBreve() {
    return this.registerForm.get('descripcionBreve');
  }

  get imagenPerfil() {
    return this.registerForm.get('imagenPerfil');
  }

  get perfil() {
    return this.registerForm.get('perfil');
  }

  get passwordsDoNotMatch(): boolean {
    return (
      this.registerForm.hasError('passwordsMismatch') &&
      !!this.repetirPassword?.touched
    );
  }

  onImageSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.registerError = '';

    if (!file) 
    {
      this.selectedImageName = '';
      this.imagePreview = '';
      this.imagenPerfil?.setValue('');
      this.imagenPerfil?.markAsTouched();
      return;
    }

    if (!file.type.startsWith('image/')) 
    {
      this.selectedImageName = '';
      this.imagePreview = '';
      this.imagenPerfil?.setValue('');
      this.imagenPerfil?.markAsTouched();
      this.registerError = 'El archivo seleccionado debe ser una imagen.';
      return;
    }

    const maxSizeInMb = 3;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (file.size > maxSizeInBytes) 
    {
      this.selectedImageName = '';
      this.imagePreview = '';
      this.imagenPerfil?.setValue('');
      this.imagenPerfil?.markAsTouched();
      this.registerError = `La imagen no puede superar los ${maxSizeInMb}MB.`;
      return;
    }

    this.selectedImageName = file.name;
    this.imagenPerfil?.setValue(file.name);
    this.imagenPerfil?.markAsTouched();

    const reader = new FileReader();

    reader.onload = () => 
    {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  register(): void 
  {
    this.registerError = '';
    this.registerSuccess = '';

    if (this.registerForm.invalid) 
    {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();
    const users = this.getStoredUsers();

    const emailExists = users.some(
      (user) => user.correo.toLowerCase() === formValue.correo!.toLowerCase()
    );

    if (emailExists) 
    {
      this.correo?.setErrors({ duplicated: true });
      this.registerError = 'Ya existe una cuenta registrada con ese correo.';
      return;
    }

    const usernameExists = users.some(
      (user) =>
        user.nombreUsuario.toLowerCase() ===
        formValue.nombreUsuario!.toLowerCase()
    );

    if (usernameExists) 
    {
      this.nombreUsuario?.setErrors({ duplicated: true });
      this.registerError = 'Ese nombre de usuario ya está en uso.';
      return;
    }

    const newUser: User = 
    {
      id: crypto.randomUUID(),
      nombre: formValue.nombre!.trim(),
      apellido: formValue.apellido!.trim(),
      correo: formValue.correo!.trim(),
      nombreUsuario: formValue.nombreUsuario!.trim(),
      fechaNacimiento: formValue.fechaNacimiento!,
      descripcionBreve: formValue.descripcionBreve!.trim(),
      imagenPerfil: this.imagePreview,
      perfil: formValue.perfil as UserProfile,
    };

    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    this.registerSuccess = 'Cuenta creada correctamente. Redirigiendo al feed...';

    setTimeout(() => {
      this.router.navigateByUrl('/publicaciones');
    }, 900);
  }

  private getStoredUsers(): User[] 
  {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) as User[] : [];
  }
}