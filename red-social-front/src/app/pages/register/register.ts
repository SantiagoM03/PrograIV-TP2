import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { UserProfile } from '../../models/user';
import { AuthService, RegisterRequest } from '../../services/auth';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
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
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  registerError = '';
  registerSuccess = '';
  backendError = '';

  selectedImageName = '';
  imagePreview = '';
  selectedImageFile: File | null = null;

  isLoading = false;

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

      /*
        Este campo no me manda el archivo.
        Solo me sirve para validar que el usuario haya elegido una imagen.
        El archivo real lo guardo en selectedImageFile.
      */
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
    },
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.registerError = '';
    this.backendError = '';

    if (!file) {
      this.clearSelectedImage();
      this.imagenPerfil?.markAsTouched();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.clearSelectedImage();
      this.imagenPerfil?.markAsTouched();
      this.registerError = 'El archivo seleccionado debe ser una imagen.';
      return;
    }

    const maxSizeInMb = 3;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      this.clearSelectedImage();
      this.imagenPerfil?.markAsTouched();
      this.registerError = `La imagen no puede superar los ${maxSizeInMb}MB.`;
      return;
    }

    /*
      Esto es lo importante:
      acá guardo el archivo real para mandarlo al backend en FormData.
    */
    this.selectedImageFile = file;

    this.selectedImageName = file.name;
    this.imagenPerfil?.setValue(file.name);
    this.imagenPerfil?.markAsTouched();

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    this.registerError = '';
    this.registerSuccess = '';
    this.backendError = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.selectedImageFile) {
      this.backendError = 'La imagen de perfil es obligatoria.';
      return;
    }

    const formValue = this.registerForm.getRawValue();

    const registerData: RegisterRequest = {
      nombre: formValue.nombre!.trim(),
      apellido: formValue.apellido!.trim(),
      correo: formValue.correo!.trim(),
      nombreUsuario: formValue.nombreUsuario!.trim(),
      password: formValue.password!,
      repetirPassword: formValue.repetirPassword!,
      fechaNacimiento: formValue.fechaNacimiento!,
      descripcionBreve: formValue.descripcionBreve!.trim(),
      perfil: formValue.perfil as UserProfile,
      imagenPerfil: this.selectedImageFile,
    };

    this.isLoading = true;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.registerSuccess = 'Cuenta creada correctamente. Redirigiendo al feed...';

        this.router.navigateByUrl('/publicaciones');
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.backendError = error.message;
      },
    });
  }

  private clearSelectedImage(): void {
    this.selectedImageName = '';
    this.imagePreview = '';
    this.selectedImageFile = null;
    this.imagenPerfil?.setValue('');
  }
}