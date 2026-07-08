import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import { User } from '../../models/user';
import {
  CreateUserByAdminRequest,
  UsersService,
} from '../../services/users';
import { HoldToConfirmDirective } from '../../directives/hold-to-confirm.directive';
import { SmartComposerDirective } from '../../directives/smart-composer.directive';
import { UserAccessInsightPipe } from '../../pipes/user-access-insight.pipe';

@Component({
  selector: 'app-dashboard-users',
  imports: [
  CommonModule,
  ReactiveFormsModule,
  SmartComposerDirective,
  HoldToConfirmDirective,
  UserAccessInsightPipe],
  templateUrl: './dashboard-users.html',
  styleUrl: './dashboard-users.scss',
})
export class DashboardUsers implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  users: User[] = [];

  selectedImageFile: File | null = null;
  selectedImagePreview = '';

  isLoadingUsers = true;
  isCreatingUser = false;
  processingUserId: string | null = null;

  pageError = '';
  createError = '';
  successMessage = '';

  userForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    repetirPassword: ['', [Validators.required, Validators.minLength(6)]],
    fechaNacimiento: ['', [Validators.required]],
    descripcionBreve: ['', [Validators.required, Validators.maxLength(200)]],
    perfil: ['usuario', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  get nombre() {
    return this.userForm.get('nombre');
  }

  get apellido() {
    return this.userForm.get('apellido');
  }

  get correo() {
    return this.userForm.get('correo');
  }

  get nombreUsuario() {
    return this.userForm.get('nombreUsuario');
  }

  get password() {
    return this.userForm.get('password');
  }

  get repetirPassword() {
    return this.userForm.get('repetirPassword');
  }

  get fechaNacimiento() {
    return this.userForm.get('fechaNacimiento');
  }

  get descripcionBreve() {
    return this.userForm.get('descripcionBreve');
  }

  get perfil() {
    return this.userForm.get('perfil');
  }

  loadUsers(): void {
    this.pageError = '';
    this.isLoadingUsers = true;

    this.usersService
      .listUsers()
      .pipe(
        finalize(() => {
          this.isLoadingUsers = false;
        }),
      )
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error: Error) => {
          this.pageError = error.message;
        },
      });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.selectedImageFile = null;
    this.selectedImagePreview = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.createError = 'El archivo seleccionado debe ser una imagen.';
      input.value = '';
      return;
    }

    this.createError = '';
    this.selectedImageFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImagePreview = String(reader.result);
    };

    reader.readAsDataURL(file);
  }

  createUser(): void {
    this.createError = '';
    this.successMessage = '';

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (!this.selectedImageFile) {
      this.createError = 'La imagen de perfil es obligatoria.';
      return;
    }

    const formValue = this.userForm.getRawValue();

    if (formValue.password !== formValue.repetirPassword) {
      this.createError = 'Las contraseñas no coinciden.';
      return;
    }

    const payload: CreateUserByAdminRequest = {
      nombre: formValue.nombre!.trim(),
      apellido: formValue.apellido!.trim(),
      correo: formValue.correo!.trim(),
      nombreUsuario: formValue.nombreUsuario!.trim(),
      password: formValue.password!,
      repetirPassword: formValue.repetirPassword!,
      fechaNacimiento: formValue.fechaNacimiento!,
      descripcionBreve: formValue.descripcionBreve!.trim(),
      perfil: formValue.perfil as 'usuario' | 'administrador',
      imagenPerfil: this.selectedImageFile,
    };

    this.isCreatingUser = true;

    this.usersService
      .createUser(payload)
      .pipe(
        finalize(() => {
          this.isCreatingUser = false;
        }),
      )
      .subscribe({
        next: (createdUser) => {
          this.users = [createdUser, ...this.users];
          this.successMessage = 'Usuario creado correctamente.';

          this.userForm.reset({
            nombre: '',
            apellido: '',
            correo: '',
            nombreUsuario: '',
            password: '',
            repetirPassword: '',
            fechaNacimiento: '',
            descripcionBreve: '',
            perfil: 'usuario',
          });

          this.selectedImageFile = null;
          this.selectedImagePreview = '';
        },
        error: (error: Error) => {
          this.createError = error.message;
        },
      });
  }

  disableUser(user: User): void 
  {
    this.processingUserId = user.id;
    this.pageError = '';
    this.successMessage = '';

    this.usersService
      .disableUser(user.id)
      .pipe(
        finalize(() => {
          this.processingUserId = null;
        }),
      )
      .subscribe({
        next: (updatedUser) => {
          this.replaceUser(updatedUser);
          this.successMessage = `Usuario @${updatedUser.nombreUsuario} deshabilitado correctamente.`;
        },
        error: (error: Error) => {
          this.pageError = error.message;
        },
      });
  }

  enableUser(user: User): void {
    this.processingUserId = user.id;
    this.pageError = '';
    this.successMessage = '';

    this.usersService
      .enableUser(user.id)
      .pipe(
        finalize(() => {
          this.processingUserId = null;
        }),
      )
      .subscribe({
        next: (updatedUser) => {
          this.replaceUser(updatedUser);
          this.successMessage = `Usuario @${updatedUser.nombreUsuario} habilitado correctamente.`;
        },
        error: (error: Error) => {
          this.pageError = error.message;
        },
      });
  }

  private replaceUser(updatedUser: User): void {
    this.users = this.users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user,
    );
  }

  formatDate(dateValue: string): string {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}