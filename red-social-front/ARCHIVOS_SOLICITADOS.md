# Archivos solicitados

## src/app/app.routes.ts

~~~
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./pages/posts/posts').then((m) => m.Posts),
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/my-profile/my-profile').then((m) => m.MyProfile),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
~~~

## src/app/app.scss

~~~
:host {
  display: block;
  min-height: 100vh;
}
~~~

## src/app/app.ts

~~~
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('red-social-front');
}
~~~

## src/app/components/navbar/navbar.html

~~~
<header class="navbar">
  <a routerLink="/publicaciones" class="brand">
    <div class="brand-mark">
      <span>RS</span>
    </div>

    <div class="brand-copy">
      <strong>Conecta</strong>
      <small>Red social</small>
    </div>
  </a>

  <nav class="nav-links">
    <a routerLink="/publicaciones" routerLinkActive="active">
      <span>Publicaciones</span>
    </a>

    <a routerLink="/mi-perfil" routerLinkActive="active">
      <span>Mi perfil</span>
    </a>

    <a routerLink="/login" routerLinkActive="active">
      <span>Login</span>
    </a>

    <a routerLink="/registro" routerLinkActive="active">
      <span>Registro</span>
    </a>
  </nav>
</header>
~~~

## src/app/components/navbar/navbar.scss

~~~
.navbar {
  height: 84px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(12, 16, 34, 0.72);
  border-bottom: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(22px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  position: relative;
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.45), transparent 35%),
    linear-gradient(135deg, #7c3aed, #06b6d4);
  box-shadow: 0 16px 34px rgba(124, 58, 237, 0.38);
}

.brand-mark::after {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.16);
}

.brand-mark span {
  color: white;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.brand-copy strong {
  font-size: 20px;
  color: #ffffff;
  letter-spacing: -0.7px;
}

.brand-copy small {
  margin-top: 5px;
  color: #96a2bd;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px;
  border-radius: 999px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
}

.nav-links a {
  padding: 11px 16px;
  border-radius: 999px;
  color: #aab3c5;
  font-size: 14px;
  font-weight: 800;
  transition: 0.2s ease;
}

.nav-links a:hover {
  color: white;
  background: rgba(255,255,255,0.09);
}

.nav-links a.active {
  color: white;
  background: linear-gradient(135deg, rgba(124,58,237,0.95), rgba(6,182,212,0.82));
  box-shadow: 0 10px 28px rgba(124, 58, 237, 0.35);
}

@media (max-width: 760px) {
  .navbar {
    height: auto;
    padding: 16px;
    flex-direction: column;
    gap: 15px;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    border-radius: 22px;
  }

  .nav-links a {
    padding: 10px 13px;
  }
}
~~~

## src/app/components/navbar/navbar.ts

~~~
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {}
~~~

## src/app/pages/login/login.html

~~~
<main class="page">
  <section class="page-container auth-shell">
    <article class="auth-hero glass-card">
      <span class="section-eyebrow">Tu comunidad digital</span>

      <h1 class="page-title">
        VolvÃ© a entrar a tu <span>mundo social</span>
      </h1>

      <p class="page-subtitle">
        CompartÃ­ ideas, descubrÃ­ publicaciones, reaccionÃ¡ a contenido y mantenÃ© tu perfil siempre actualizado.
      </p>

      <div class="social-preview">
        <div class="floating-user user-one">
          <img src="https://i.pravatar.cc/120?img=12" alt="Usuario destacado">
        </div>

        <div class="floating-user user-two">
          <img src="https://i.pravatar.cc/120?img=32" alt="Usuario destacado">
        </div>

        <div class="floating-user user-three">
          <img src="https://i.pravatar.cc/120?img=47" alt="Usuario destacado">
        </div>

        <div class="mini-post">
          <div class="mini-post-header">
            <span></span>
            <div>
              <strong>Nuevo post</strong>
              <small>Hace unos minutos</small>
            </div>
          </div>

          <p>
            Una red social pensada para conectar personas, ideas y momentos.
          </p>
        </div>
      </div>
    </article>

    <article class="auth-card glass-card">
      <h2>Iniciar sesiÃ³n</h2>
      <p>IngresÃ¡ con tu correo o nombre de usuario para continuar.</p>

      <form [formGroup]="loginForm" (ngSubmit)="login()">
        <div class="form-field">
          <label for="usuarioOCorreo">Correo o nombre de usuario</label>

          <input
            id="usuarioOCorreo"
            type="text"
            formControlName="usuarioOCorreo"
            placeholder="ej: valen.suetta o valen@mail.com"
          >

          @if (usuarioOCorreo?.touched && usuarioOCorreo?.hasError('required')) {
            <small class="error">El correo o nombre de usuario es obligatorio.</small>
          }

          @if (usuarioOCorreo?.touched && usuarioOCorreo?.hasError('minlength')) {
            <small class="error">Debe tener al menos 3 caracteres.</small>
          }
        </div>

        <div class="form-field">
          <label for="password">ContraseÃ±a</label>

          <input
            id="password"
            type="password"
            formControlName="password"
            placeholder="MÃ­nimo 8 caracteres, una mayÃºscula y un nÃºmero"
          >

          @if (password?.touched && password?.hasError('required')) {
            <small class="error">La contraseÃ±a es obligatoria.</small>
          }

          @if (password?.touched && password?.hasError('pattern')) {
            <small class="error">
              La contraseÃ±a debe tener al menos 8 caracteres, una mayÃºscula y un nÃºmero.
            </small>
          }
        </div>

        @if (loginError) {
          <div class="form-alert">
            {{ loginError }}
          </div>
        }

        <div class="auth-actions">
          <button
            class="btn btn-primary"
            type="submit"
            [disabled]="loginForm.invalid"
          >
            Entrar a mi cuenta
          </button>

          <p class="auth-link">
            Â¿TodavÃ­a no tenÃ©s cuenta?
            <a routerLink="/registro">Crear cuenta</a>
          </p>
        </div>
      </form>
    </article>
  </section>
</main>
~~~

## src/app/pages/login/login.scss

~~~
.social-preview {
  min-height: 320px;
  margin-top: 36px;
  position: relative;
}

.floating-user {
  position: absolute;
  width: 84px;
  height: 84px;
  padding: 5px;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #06b6d4);
  box-shadow: 0 18px 40px rgba(0,0,0,0.28);
}

.floating-user img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 999px;
  border: 3px solid #11162d;
}

.user-one {
  top: 20px;
  left: 24px;
}

.user-two {
  top: 82px;
  right: 48px;
}

.user-three {
  bottom: 34px;
  left: 120px;
}

.mini-post {
  width: min(100%, 390px);
  position: absolute;
  right: 0;
  bottom: 18px;
  padding: 20px;
  border-radius: 26px;
  background: rgba(255,255,255,0.11);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(16px);
}

.mini-post-header {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 14px;
}

.mini-post-header span {
  width: 42px;
  height: 42px;
  border-radius: 15px;
  background: linear-gradient(135deg, #f43f5e, #7c3aed);
}

.mini-post-header strong {
  display: block;
  font-size: 15px;
}

.mini-post-header small {
  color: #aab3c5;
  font-weight: 600;
}

.mini-post p {
  margin: 0;
  color: #dbeafe;
  line-height: 1.6;
}

.form-alert {
  margin: 4px 0 18px;
  padding: 13px 15px;
  border-radius: 16px;
  color: #fecdd3;
  background: rgba(244, 63, 94, 0.13);
  border: 1px solid rgba(244, 63, 94, 0.28);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}
~~~

## src/app/pages/login/login.ts

~~~
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
        nombre: 'ValentÃ­n',
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

    this.loginError = 'No pudimos iniciar sesiÃ³n. RevisÃ¡ los datos ingresados.';
  }
}
~~~

## src/app/pages/my-profile/my-profile.html

~~~
<main class="page profile-page">
  <section class="page-container profile-layout">
    <article class="profile-hero glass-card">
      <div class="profile-cover">
        <div class="cover-orb orb-one"></div>
        <div class="cover-orb orb-two"></div>
        <div class="cover-orb orb-three"></div>

        <div class="cover-content">
          <span>Perfil activo</span>
          <strong>Tu espacio dentro de la comunidad</strong>
        </div>
      </div>

      <div class="profile-main">
        <div class="avatar-wrapper">
          <img
            class="profile-avatar"
            src="https://i.pravatar.cc/220?img=15"
            alt="Foto de perfil"
          >

          <span class="status-dot"></span>
        </div>

        <div class="profile-info">
          <div class="profile-heading">
            <div>
              <span class="section-eyebrow">Mi perfil</span>

              <h1>ValentÃ­n Suetta</h1>

              <p class="username">@valen.social</p>
            </div>

            <button class="btn btn-primary" type="button">
              Editar perfil
            </button>
          </div>

          <p class="bio">
            Desarrollador en formaciÃ³n, compartiendo avances, ideas y experiencias dentro
            de una red social moderna pensada para conectar usuarios.
          </p>

          <div class="profile-meta">
            <div>
              <span>Correo</span>
              <strong>valen@mail.com</strong>
            </div>

            <div>
              <span>Fecha de nacimiento</span>
              <strong>01/01/2000</strong>
            </div>

            <div>
              <span>Perfil</span>
              <strong>Usuario</strong>
            </div>
          </div>
        </div>
      </div>
    </article>

    <section class="profile-grid">
      <aside class="profile-summary glass-card">
        <h2>Resumen social</h2>

        <div class="summary-list">
          <div class="summary-item">
            <div class="summary-icon">âœ¦</div>

            <div>
              <strong>12</strong>
              <span>Publicaciones creadas</span>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">â™¥</div>

            <div>
              <strong>284</strong>
              <span>Me gusta recibidos</span>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">ðŸ’¬</div>

            <div>
              <strong>63</strong>
              <span>Comentarios recibidos</span>
            </div>
          </div>
        </div>

        <div class="profile-note">
          <strong>PrÃ³xima integraciÃ³n</strong>
          <p>
            Estos datos se conectarÃ¡n al backend cuando tengamos usuarios,
            publicaciones, comentarios y likes reales.
          </p>
        </div>
      </aside>

      <section class="profile-activity">
        <div class="section-header">
          <div>
            <span>Actividad reciente</span>
            <h2>Ãšltimas publicaciones</h2>
          </div>

          <button class="btn btn-secondary" type="button">
            Ver todas
          </button>
        </div>

        <article class="profile-post glass-card featured">
          <div class="post-header">
            <div>
              <span class="post-date">Hace 12 minutos</span>
              <h3>DiseÃ±ando mi primera red social</h3>
            </div>

            <button class="post-options" type="button" aria-label="MÃ¡s opciones">
              â‹¯
            </button>
          </div>

          <p>
            Primer avance visual del proyecto: navegaciÃ³n, formularios, feed y perfil
            con una identidad grÃ¡fica clara para toda la aplicaciÃ³n.
          </p>

          <div class="post-visual">
            <div>
              <span>UX Sprint 1</span>
              <strong>Interfaz consistente y moderna</strong>
            </div>
          </div>

          <div class="post-stats">
            <span>â™¥ 48 me gusta</span>
            <span>ðŸ’¬ 9 comentarios</span>
          </div>
        </article>

        <article class="profile-post glass-card">
          <div class="post-header">
            <div>
              <span class="post-date">Hace 1 hora</span>
              <h3>Perfil de usuario preparado para datos reales</h3>
            </div>

            <button class="post-options" type="button" aria-label="MÃ¡s opciones">
              â‹¯
            </button>
          </div>

          <p>
            Esta pantalla despuÃ©s va a mostrar los datos reales del usuario logueado,
            su foto de perfil, descripciÃ³n breve y sus Ãºltimas publicaciones.
          </p>

          <div class="comments-preview">
            <strong>Comentarios recientes</strong>

            <div class="comment-item">
              <img src="https://i.pravatar.cc/80?img=20" alt="Foto de usuario">
              <p>
                <b>Bruno:</b> Muy buena estructura para conectar con el backend.
              </p>
            </div>

            <div class="comment-item">
              <img src="https://i.pravatar.cc/80?img=27" alt="Foto de usuario">
              <p>
                <b>Camila:</b> El diseÃ±o se siente mucho mÃ¡s cercano a una red social real.
              </p>
            </div>
          </div>

          <div class="post-stats">
            <span>â™¥ 31 me gusta</span>
            <span>ðŸ’¬ 6 comentarios</span>
          </div>
        </article>

        <article class="profile-post glass-card">
          <div class="post-header">
            <div>
              <span class="post-date">Ayer</span>
              <h3>Experiencia visual antes de conectar lÃ³gica</h3>
            </div>

            <button class="post-options" type="button" aria-label="MÃ¡s opciones">
              â‹¯
            </button>
          </div>

          <p>
            Aunque todavÃ­a no estÃ© conectado el backend, dejar bien armadas las pantallas
            ayuda a tener una app mÃ¡s profesional y fÃ¡cil de integrar.
          </p>

          <div class="post-stats">
            <span>â™¥ 22 me gusta</span>
            <span>ðŸ’¬ 4 comentarios</span>
          </div>
        </article>
      </section>
    </section>
  </section>
</main>
~~~

## src/app/pages/my-profile/my-profile.scss

~~~
.profile-page {
  padding-top: 34px;
}

.profile-layout {
  display: grid;
  gap: 24px;
}

.profile-hero {
  overflow: hidden;
}

.profile-cover {
  min-height: 260px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.35), transparent 18%),
    radial-gradient(circle at 82% 18%, rgba(6, 182, 212, 0.48), transparent 26%),
    radial-gradient(circle at 70% 88%, rgba(244, 63, 94, 0.42), transparent 25%),
    linear-gradient(135deg, #7c3aed 0%, #11162d 48%, #06b6d4 100%);
}

.cover-orb {
  position: absolute;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.orb-one {
  width: 240px;
  height: 240px;
  left: 58px;
  top: 38px;
}

.orb-two {
  width: 150px;
  height: 150px;
  right: 120px;
  top: 42px;
}

.orb-three {
  width: 95px;
  height: 95px;
  right: 310px;
  bottom: 36px;
}

.cover-content {
  position: absolute;
  left: 34px;
  bottom: 34px;
  max-width: 420px;
  padding: 22px;
  border-radius: 28px;
  background: rgba(12, 16, 34, 0.48);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
}

.cover-content span {
  display: block;
  margin-bottom: 8px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.cover-content strong {
  display: block;
  color: white;
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.8px;
}

.profile-main {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 28px;
  padding: 0 34px 34px;
}

.avatar-wrapper {
  width: 180px;
  height: 180px;
  margin-top: -72px;
  position: relative;
}

.profile-avatar {
  width: 180px;
  height: 180px;
  border-radius: 44px;
  object-fit: cover;
  border: 7px solid #11162d;
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.34);
}

.status-dot {
  width: 24px;
  height: 24px;
  position: absolute;
  right: 13px;
  bottom: 15px;
  border-radius: 999px;
  background: #22c55e;
  border: 5px solid #11162d;
  box-shadow: 0 0 22px rgba(34, 197, 94, 0.7);
}

.profile-info {
  padding-top: 30px;
}

.profile-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
}

.profile-heading h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 1;
  letter-spacing: -1.7px;
}

.username {
  margin: 10px 0 0;
  color: #a78bfa;
  font-size: 16px;
  font-weight: 900;
}

.bio {
  max-width: 780px;
  margin: 18px 0 0;
  color: #cbd5e1;
  line-height: 1.75;
  font-size: 15px;
}

.profile-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 24px;
}

.profile-meta div {
  padding: 17px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
}

.profile-meta span {
  display: block;
  margin-bottom: 6px;
  color: #aab3c5;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.profile-meta strong {
  display: block;
  color: #f8fafc;
  font-size: 14px;
  word-break: break-word;
}

.profile-grid {
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.profile-summary {
  position: sticky;
  top: 108px;
  padding: 24px;
}

.profile-summary h2 {
  margin: 0 0 18px;
  font-size: 24px;
  letter-spacing: -0.6px;
}

.summary-list {
  display: grid;
  gap: 13px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
}

.summary-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 17px;
  color: white;
  font-weight: 900;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.3), transparent 35%),
    linear-gradient(135deg, #7c3aed, #06b6d4);
  box-shadow: 0 14px 30px rgba(124, 58, 237, 0.24);
}

.summary-item strong {
  display: block;
  font-size: 25px;
  letter-spacing: -0.6px;
}

.summary-item span {
  display: block;
  margin-top: 3px;
  color: #aab3c5;
  font-size: 13px;
  font-weight: 700;
}

.profile-note {
  margin-top: 20px;
  padding: 18px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(6, 182, 212, 0.18), transparent 38%),
    rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(6, 182, 212, 0.18);
}

.profile-note strong {
  display: block;
  margin-bottom: 8px;
  color: #67e8f9;
}

.profile-note p {
  margin: 0;
  color: #aab3c5;
  line-height: 1.6;
  font-size: 13px;
}

.profile-activity {
  display: grid;
  gap: 18px;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding: 0 4px;
}

.section-header span {
  display: block;
  margin-bottom: 5px;
  color: #a78bfa;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-header h2 {
  margin: 0;
  font-size: 30px;
  letter-spacing: -0.9px;
}

.profile-post {
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.profile-post::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 38%);
  pointer-events: none;
}

.profile-post > * {
  position: relative;
  z-index: 1;
}

.profile-post.featured::after {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  right: -120px;
  top: -120px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.32), transparent 68%);
  pointer-events: none;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.post-date {
  display: block;
  margin-bottom: 8px;
  color: #aab3c5;
  font-size: 13px;
  font-weight: 800;
}

.post-header h3 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.1;
  letter-spacing: -0.8px;
}

.post-options {
  cursor: pointer;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: 15px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
  font-size: 24px;
  line-height: 1;
  transition: 0.2s ease;
}

.post-options:hover {
  background: rgba(255, 255, 255, 0.14);
}

.profile-post p {
  margin: 14px 0 0;
  color: #cbd5e1;
  line-height: 1.72;
  font-size: 15px;
}

.post-visual {
  height: 240px;
  margin-top: 20px;
  display: grid;
  place-items: end start;
  padding: 26px;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.34), transparent 18%),
    radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.52), transparent 25%),
    radial-gradient(circle at 68% 88%, rgba(244, 63, 94, 0.44), transparent 24%),
    linear-gradient(135deg, #7c3aed 0%, #11162d 48%, #06b6d4 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.post-visual div {
  max-width: 370px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(12, 16, 34, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
}

.post-visual span {
  display: block;
  margin-bottom: 7px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.post-visual strong {
  display: block;
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -0.7px;
}

.comments-preview {
  margin-top: 20px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.065);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-preview > strong {
  display: block;
  margin-bottom: 14px;
  font-size: 15px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.comment-item img {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  object-fit: cover;
}

.comment-item p {
  margin: 0;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.55;
}

.comment-item b {
  color: #f8fafc;
}

.post-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
}

.post-stats span {
  display: inline-flex;
  align-items: center;
  min-height: 39px;
  padding: 0 13px;
  border-radius: 999px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 1050px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-summary {
    position: static;
  }

  .summary-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 850px) {
  .profile-main {
    grid-template-columns: 1fr;
  }

  .avatar-wrapper {
    margin-bottom: -14px;
  }

  .profile-heading {
    flex-direction: column;
  }

  .profile-meta {
    grid-template-columns: 1fr;
  }

  .summary-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .profile-main {
    padding: 0 22px 26px;
  }

  .cover-content {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }

  .cover-content strong {
    font-size: 23px;
  }

  .avatar-wrapper,
  .profile-avatar {
    width: 150px;
    height: 150px;
  }

  .profile-avatar {
    border-radius: 36px;
  }

  .section-header {
    align-items: stretch;
    flex-direction: column;
  }

  .post-visual {
    height: 210px;
    border-radius: 24px;
  }

  .post-visual div {
    max-width: none;
  }
}
~~~

## src/app/pages/my-profile/my-profile.ts

~~~
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-profile',
  imports: [],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile {}
~~~

## src/app/pages/posts/posts.html

~~~
<main class="page posts-page">
  <section class="page-container posts-layout">
    <aside class="feed-panel glass-card">
      <div class="feed-panel-content">
        <span class="section-eyebrow">Feed social</span>

        <h1>
          DescubrÃ­ quÃ© estÃ¡ pasando en la red
        </h1>

        <p>
          Un espacio para compartir publicaciones, ideas, momentos e interactuar con otros usuarios.
        </p>

        <button class="btn btn-primary" type="button">
          Crear publicaciÃ³n
        </button>

        <div class="feed-stats">
          <div>
            <strong>128</strong>
            <span>Publicaciones</span>
          </div>

          <div>
            <strong>42</strong>
            <span>Usuarios activos</span>
          </div>

          <div>
            <strong>389</strong>
            <span>Interacciones</span>
          </div>
        </div>
      </div>
    </aside>

    <section class="feed-main">
      <div class="feed-header glass-card">
        <div>
          <span>Publicaciones</span>
          <h2>Feed principal</h2>
        </div>

        <div class="feed-filters">
          <button class="active" type="button">Recientes</button>
          <button type="button">MÃ¡s gustadas</button>
        </div>
      </div>

      <article class="composer-card glass-card">
        <div class="composer-avatar">
          <img src="https://i.pravatar.cc/120?img=15" alt="Foto de perfil">
        </div>

        <div class="composer-content">
          <strong>Â¿QuÃ© querÃ©s compartir hoy?</strong>
          <span>MÃ¡s adelante este acceso abrirÃ¡ el formulario para crear una publicaciÃ³n.</span>
        </div>

        <button class="composer-action" type="button">
          Publicar
        </button>
      </article>

      <article class="post-card glass-card featured-post">
        <div class="post-top">
          <div class="post-user">
            <img src="https://i.pravatar.cc/120?img=32" alt="Foto de perfil de SofÃ­a">

            <div>
              <strong>SofÃ­a RamÃ­rez</strong>
              <span>@sofi.crea Â· hace 8 min</span>
            </div>
          </div>

          <button class="post-menu" type="button" aria-label="MÃ¡s opciones">
            â‹¯
          </button>
        </div>

        <div class="post-body">
          <div class="post-badge">Tendencia</div>

          <h3>DiseÃ±ando una comunidad mÃ¡s humana</h3>

          <p>
            Las mejores redes no son solamente publicaciones: son conversaciones, perfiles con identidad
            y espacios donde cada interacciÃ³n se siente natural.
          </p>

          <div class="post-media post-media-gradient">
            <div class="media-orbit orbit-one"></div>
            <div class="media-orbit orbit-two"></div>
            <div class="media-orbit orbit-three"></div>

            <div class="media-card">
              <span>Social Feed</span>
              <strong>Conexiones reales en tiempo real</strong>
            </div>
          </div>
        </div>

        <div class="post-footer">
          <button type="button">
            <span>â™¥</span>
            248 me gusta
          </button>

          <button type="button">
            <span>ðŸ’¬</span>
            37 comentarios
          </button>

          <button type="button">
            <span>â†—</span>
            Ver publicaciÃ³n
          </button>
        </div>
      </article>

      <article class="post-card glass-card">
        <div class="post-top">
          <div class="post-user">
            <img src="https://i.pravatar.cc/120?img=12" alt="Foto de perfil de Mateo">

            <div>
              <strong>Mateo Duarte</strong>
              <span>@mateo.dev Â· hace 26 min</span>
            </div>
          </div>

          <button class="post-menu" type="button" aria-label="MÃ¡s opciones">
            â‹¯
          </button>
        </div>

        <div class="post-body">
          <h3>Primer avance del proyecto</h3>

          <p>
            Ya tenemos navegaciÃ³n, login, registro y una lÃ­nea visual clara. El prÃ³ximo paso serÃ¡ conectar
            esta experiencia con datos reales desde el backend.
          </p>
        </div>

        <div class="post-footer">
          <button type="button">
            <span>â™¥</span>
            96 me gusta
          </button>

          <button type="button">
            <span>ðŸ’¬</span>
            14 comentarios
          </button>

          <button type="button">
            <span>â†—</span>
            Ver publicaciÃ³n
          </button>
        </div>
      </article>

      <article class="post-card glass-card">
        <div class="post-top">
          <div class="post-user">
            <img src="https://i.pravatar.cc/120?img=47" alt="Foto de perfil de LucÃ­a">

            <div>
              <strong>LucÃ­a FernÃ¡ndez</strong>
              <span>@luchi.social Â· hace 1 h</span>
            </div>
          </div>

          <button class="post-menu" type="button" aria-label="MÃ¡s opciones">
            â‹¯
          </button>
        </div>

        <div class="post-body">
          <h3>Una interfaz tambiÃ©n comunica</h3>

          <p>
            Si la aplicaciÃ³n es una red social, el diseÃ±o tiene que transmitir comunidad, movimiento,
            contenido e interacciÃ³n. No alcanza con una pantalla funcional.
          </p>

          <div class="post-media image-style">
            <div class="image-style-content">
              <span>UX</span>
              <strong>DiseÃ±o consistente, claro y memorable</strong>
            </div>
          </div>
        </div>

        <div class="post-footer">
          <button type="button">
            <span>â™¥</span>
            173 me gusta
          </button>

          <button type="button">
            <span>ðŸ’¬</span>
            22 comentarios
          </button>

          <button type="button">
            <span>â†—</span>
            Ver publicaciÃ³n
          </button>
        </div>
      </article>
    </section>

    <aside class="right-panel">
      <section class="trend-card glass-card">
        <h3>Temas activos</h3>

        <div class="trend-item">
          <span>#Angular</span>
          <small>34 publicaciones</small>
        </div>

        <div class="trend-item">
          <span>#NestJS</span>
          <small>21 publicaciones</small>
        </div>

        <div class="trend-item">
          <span>#MongoDB</span>
          <small>18 publicaciones</small>
        </div>
      </section>

      <section class="people-card glass-card">
        <h3>Usuarios destacados</h3>

        <div class="person-item">
          <img src="https://i.pravatar.cc/80?img=20" alt="Foto de perfil">
          <div>
            <strong>Bruno Lima</strong>
            <span>@bruno.code</span>
          </div>
        </div>

        <div class="person-item">
          <img src="https://i.pravatar.cc/80?img=27" alt="Foto de perfil">
          <div>
            <strong>Camila Torres</strong>
            <span>@cami.ui</span>
          </div>
        </div>

        <div class="person-item">
          <img src="https://i.pravatar.cc/80?img=41" alt="Foto de perfil">
          <div>
            <strong>TomÃ¡s Silva</strong>
            <span>@tomi.dev</span>
          </div>
        </div>
      </section>
    </aside>
  </section>
</main>
~~~

## src/app/pages/posts/posts.scss

~~~
.posts-page {
  padding-top: 34px;
}

.posts-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 280px;
  gap: 24px;
  align-items: start;
}

.feed-panel,
.right-panel {
  position: sticky;
  top: 108px;
}

.feed-panel {
  overflow: hidden;
}

.feed-panel::before {
  content: '';
  position: absolute;
  width: 250px;
  height: 250px;
  left: -110px;
  top: -110px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.42), transparent 68%);
  pointer-events: none;
}

.feed-panel::after {
  content: '';
  position: absolute;
  width: 220px;
  height: 220px;
  right: -110px;
  bottom: -110px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.28), transparent 68%);
  pointer-events: none;
}

.feed-panel-content {
  position: relative;
  z-index: 1;
  padding: 28px;
}

.feed-panel h1 {
  margin: 0;
  font-size: 35px;
  line-height: 0.98;
  letter-spacing: -1.3px;
}

.feed-panel p {
  margin: 18px 0 24px;
  color: #aab3c5;
  line-height: 1.7;
  font-size: 15px;
}

.feed-stats {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.feed-stats div {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
}

.feed-stats strong {
  display: block;
  font-size: 24px;
  letter-spacing: -0.5px;
}

.feed-stats span {
  display: block;
  margin-top: 4px;
  color: #aab3c5;
  font-size: 13px;
  font-weight: 700;
}

.feed-main {
  display: grid;
  gap: 18px;
}

.feed-header {
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.feed-header span {
  display: block;
  margin-bottom: 4px;
  color: #a78bfa;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.feed-header h2 {
  margin: 0;
  font-size: 27px;
  letter-spacing: -0.8px;
}

.feed-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
}

.feed-filters button {
  cursor: pointer;
  padding: 10px 13px;
  border-radius: 999px;
  color: #aab3c5;
  background: transparent;
  font-weight: 800;
  transition: 0.2s ease;
}

.feed-filters button:hover,
.feed-filters button.active {
  color: white;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(6, 182, 212, 0.82));
}

.composer-card {
  padding: 18px;
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 14px;
  align-items: center;
}

.composer-avatar {
  width: 54px;
  height: 54px;
  padding: 3px;
  border-radius: 20px;
  background: linear-gradient(135deg, #7c3aed, #06b6d4);
}

.composer-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 17px;
  object-fit: cover;
  border: 2px solid #11162d;
}

.composer-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
}

.composer-content span {
  color: #aab3c5;
  font-size: 13px;
  font-weight: 600;
}

.composer-action {
  cursor: pointer;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 15px;
  color: white;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.105);
  border: 1px solid rgba(255, 255, 255, 0.14);
  transition: 0.2s ease;
}

.composer-action:hover {
  transform: translateY(-2px);
  background: rgba(124, 58, 237, 0.35);
}

.post-card {
  padding: 22px;
  overflow: hidden;
  position: relative;
}

.post-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 38%);
  pointer-events: none;
}

.post-top,
.post-body,
.post-footer {
  position: relative;
  z-index: 1;
}

.post-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 13px;
}

.post-user img {
  width: 54px;
  height: 54px;
  border-radius: 19px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.16);
}

.post-user strong {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
}

.post-user span {
  color: #aab3c5;
  font-size: 13px;
  font-weight: 700;
}

.post-menu {
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 15px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
  font-size: 24px;
  line-height: 1;
  transition: 0.2s ease;
}

.post-menu:hover {
  background: rgba(255, 255, 255, 0.14);
}

.post-badge {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 7px 11px;
  border-radius: 999px;
  color: #ffe4e6;
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.22);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.post-body h3 {
  margin: 0 0 10px;
  font-size: clamp(23px, 3vw, 31px);
  letter-spacing: -0.9px;
  line-height: 1.08;
}

.post-body p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.72;
  font-size: 15px;
}

.post-media {
  height: 280px;
  margin-top: 20px;
  border-radius: 30px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.post-media-gradient {
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.34), transparent 18%),
    radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.55), transparent 25%),
    radial-gradient(circle at 65% 88%, rgba(244, 63, 94, 0.46), transparent 24%),
    linear-gradient(135deg, #7c3aed 0%, #11162d 48%, #06b6d4 100%);
}

.media-orbit {
  position: absolute;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.32);
}

.orbit-one {
  width: 190px;
  height: 190px;
  left: 42px;
  top: 42px;
}

.orbit-two {
  width: 112px;
  height: 112px;
  right: 58px;
  top: 34px;
}

.orbit-three {
  width: 76px;
  height: 76px;
  right: 170px;
  bottom: 42px;
}

.media-card {
  position: absolute;
  left: 28px;
  bottom: 28px;
  max-width: 330px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(12, 16, 34, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
}

.media-card span {
  display: block;
  margin-bottom: 8px;
  color: #a78bfa;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.media-card strong {
  display: block;
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -0.7px;
}

.image-style {
  display: grid;
  place-items: end start;
  padding: 26px;
  background:
    linear-gradient(135deg, rgba(12, 16, 34, 0.12), rgba(12, 16, 34, 0.72)),
    repeating-linear-gradient(
      135deg,
      rgba(124, 58, 237, 0.82) 0 18px,
      rgba(6, 182, 212, 0.82) 18px 36px,
      rgba(244, 63, 94, 0.82) 36px 54px
    );
}

.image-style-content {
  max-width: 360px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(12, 16, 34, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
}

.image-style-content span {
  display: block;
  margin-bottom: 7px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
}

.image-style-content strong {
  font-size: 23px;
  line-height: 1.12;
}

.post-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
}

.post-footer button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.11);
  font-weight: 800;
  transition: 0.2s ease;
}

.post-footer button:hover {
  color: white;
  transform: translateY(-2px);
  background: rgba(124, 58, 237, 0.28);
}

.right-panel {
  display: grid;
  gap: 18px;
}

.trend-card,
.people-card {
  padding: 22px;
}

.trend-card h3,
.people-card h3 {
  margin: 0 0 16px;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.trend-item {
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.trend-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.trend-item span {
  display: block;
  color: #dbeafe;
  font-weight: 900;
}

.trend-item small {
  display: block;
  margin-top: 4px;
  color: #aab3c5;
  font-weight: 700;
}

.person-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.person-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.person-item img {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  object-fit: cover;
}

.person-item strong {
  display: block;
  font-size: 14px;
}

.person-item span {
  display: block;
  margin-top: 3px;
  color: #aab3c5;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .posts-layout {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .right-panel {
    display: none;
  }
}

@media (max-width: 880px) {
  .posts-layout {
    grid-template-columns: 1fr;
  }

  .feed-panel {
    position: relative;
    top: auto;
  }

  .feed-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 680px) {
  .feed-header {
    align-items: stretch;
    flex-direction: column;
  }

  .feed-filters {
    width: 100%;
    border-radius: 18px;
  }

  .feed-filters button {
    flex: 1;
  }

  .composer-card {
    grid-template-columns: 48px 1fr;
  }

  .composer-action {
    grid-column: 1 / -1;
  }

  .post-media {
    height: 220px;
    border-radius: 24px;
  }

  .media-card,
  .image-style-content {
    left: 18px;
    right: 18px;
    bottom: 18px;
    max-width: none;
  }

  .feed-stats {
    grid-template-columns: 1fr;
  }

  .post-footer button {
    flex: 1;
    justify-content: center;
  }
}
~~~

## src/app/pages/posts/posts.ts

~~~
import { Component } from '@angular/core';

@Component({
  selector: 'app-posts',
  imports: [],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts {}
~~~

## src/app/pages/register/register.html

~~~
<main class="page">
  <section class="page-container register-layout">
    <article class="register-copy">
      <span class="section-eyebrow">Crear perfil</span>

      <h1 class="page-title">
        Tu identidad dentro de la <span>red</span>
      </h1>

      <p class="page-subtitle">
        CompletÃ¡ tus datos para crear un perfil Ãºnico. Tu foto, descripciÃ³n y nombre de usuario
        van a ser parte de cÃ³mo otros usuarios te descubren.
      </p>

      <div class="feature-list">
        <div>
          <strong>Perfil visual</strong>
          <span>SubÃ­ una imagen para representar tu cuenta dentro de la comunidad.</span>
        </div>

        <div>
          <strong>Usuario Ãºnico</strong>
          <span>Tu nombre de usuario serÃ¡ tu identificador dentro de la red social.</span>
        </div>

        <div>
          <strong>Experiencia segura</strong>
          <span>La contraseÃ±a debe tener mÃ­nimo 8 caracteres, una mayÃºscula y un nÃºmero.</span>
        </div>
      </div>
    </article>

    <article class="register-card glass-card">
      <div class="register-card-header">
        <div>
          <h2>Registro</h2>
          <p>CreÃ¡ tu cuenta para empezar a publicar, reaccionar y comentar.</p>
        </div>

        <div class="profile-preview" [class.has-image]="imagePreview">
          @if (imagePreview) {
            <img [src]="imagePreview" alt="Vista previa de imagen de perfil">
          } @else {
            <span>Foto</span>
          }
        </div>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="register()">
        <div class="form-grid">
          <div class="form-field">
            <label for="nombre">Nombre</label>

            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              placeholder="Ej: ValentÃ­n"
            >

            @if (nombre?.touched && nombre?.hasError('required')) {
              <small class="error">El nombre es obligatorio.</small>
            }

            @if (nombre?.touched && nombre?.hasError('minlength')) {
              <small class="error">El nombre debe tener al menos 2 caracteres.</small>
            }

            @if (nombre?.touched && nombre?.hasError('maxlength')) {
              <small class="error">El nombre no puede superar los 40 caracteres.</small>
            }
          </div>

          <div class="form-field">
            <label for="apellido">Apellido</label>

            <input
              id="apellido"
              type="text"
              formControlName="apellido"
              placeholder="Ej: Suetta"
            >

            @if (apellido?.touched && apellido?.hasError('required')) {
              <small class="error">El apellido es obligatorio.</small>
            }

            @if (apellido?.touched && apellido?.hasError('minlength')) {
              <small class="error">El apellido debe tener al menos 2 caracteres.</small>
            }

            @if (apellido?.touched && apellido?.hasError('maxlength')) {
              <small class="error">El apellido no puede superar los 40 caracteres.</small>
            }
          </div>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label for="correo">Correo</label>

            <input
              id="correo"
              type="email"
              formControlName="correo"
              placeholder="Ej: usuario@mail.com"
            >

            @if (correo?.touched && correo?.hasError('required')) {
              <small class="error">El correo es obligatorio.</small>
            }

            @if (correo?.touched && correo?.hasError('email')) {
              <small class="error">IngresÃ¡ un correo vÃ¡lido.</small>
            }

            @if (correo?.touched && correo?.hasError('duplicated')) {
              <small class="error">Ese correo ya estÃ¡ registrado.</small>
            }
          </div>

          <div class="form-field">
            <label for="nombreUsuario">Nombre de usuario</label>

            <input
              id="nombreUsuario"
              type="text"
              formControlName="nombreUsuario"
              placeholder="Ej: valen.social"
            >

            @if (nombreUsuario?.touched && nombreUsuario?.hasError('required')) {
              <small class="error">El nombre de usuario es obligatorio.</small>
            }

            @if (nombreUsuario?.touched && nombreUsuario?.hasError('minlength')) {
              <small class="error">Debe tener al menos 3 caracteres.</small>
            }

            @if (nombreUsuario?.touched && nombreUsuario?.hasError('maxlength')) {
              <small class="error">No puede superar los 24 caracteres.</small>
            }

            @if (nombreUsuario?.touched && nombreUsuario?.hasError('pattern')) {
              <small class="error">Solo puede tener letras, nÃºmeros, puntos o guiones bajos.</small>
            }

            @if (nombreUsuario?.touched && nombreUsuario?.hasError('duplicated')) {
              <small class="error">Ese nombre de usuario ya estÃ¡ en uso.</small>
            }
          </div>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label for="password">ContraseÃ±a</label>

            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="MÃ­nimo 8 caracteres"
            >

            @if (password?.touched && password?.hasError('required')) {
              <small class="error">La contraseÃ±a es obligatoria.</small>
            }

            @if (password?.touched && password?.hasError('pattern')) {
              <small class="error">
                Debe tener al menos 8 caracteres, una mayÃºscula y un nÃºmero.
              </small>
            }
          </div>

          <div class="form-field">
            <label for="repetirPassword">Repetir contraseÃ±a</label>

            <input
              id="repetirPassword"
              type="password"
              formControlName="repetirPassword"
              placeholder="RepetÃ­ tu contraseÃ±a"
            >

            @if (repetirPassword?.touched && repetirPassword?.hasError('required')) {
              <small class="error">TenÃ©s que repetir la contraseÃ±a.</small>
            }

            @if (passwordsDoNotMatch) {
              <small class="error">Las contraseÃ±as no coinciden.</small>
            }
          </div>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label for="fechaNacimiento">Fecha de nacimiento</label>

            <input
              id="fechaNacimiento"
              type="date"
              formControlName="fechaNacimiento"
            >

            @if (fechaNacimiento?.touched && fechaNacimiento?.hasError('required')) {
              <small class="error">La fecha de nacimiento es obligatoria.</small>
            }
          </div>

          <div class="form-field">
            <label for="perfil">Perfil</label>

            <select id="perfil" formControlName="perfil">
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
            </select>

            @if (perfil?.touched && perfil?.hasError('required')) {
              <small class="error">El perfil es obligatorio.</small>
            }
          </div>
        </div>

        <div class="form-field">
          <label for="descripcionBreve">DescripciÃ³n breve</label>

          <textarea
            id="descripcionBreve"
            formControlName="descripcionBreve"
            placeholder="ContÃ¡ algo breve sobre vos, tus intereses o quÃ© querÃ©s compartir..."
          ></textarea>

          <div class="field-helper">
            <span>MÃ¡ximo 180 caracteres.</span>
            <span>{{ descripcionBreve?.value?.length || 0 }}/180</span>
          </div>

          @if (descripcionBreve?.touched && descripcionBreve?.hasError('required')) {
            <small class="error">La descripciÃ³n breve es obligatoria.</small>
          }

          @if (descripcionBreve?.touched && descripcionBreve?.hasError('minlength')) {
            <small class="error">Debe tener al menos 10 caracteres.</small>
          }

          @if (descripcionBreve?.touched && descripcionBreve?.hasError('maxlength')) {
            <small class="error">No puede superar los 180 caracteres.</small>
          }
        </div>

        <div class="upload-box" [class.uploaded]="selectedImageName">
          <div class="upload-info">
            <strong>Imagen de perfil</strong>

            @if (selectedImageName) {
              <span>{{ selectedImageName }}</span>
            } @else {
              <span>SeleccionÃ¡ una imagen para mostrar en tu perfil.</span>
            }

            @if (imagenPerfil?.touched && imagenPerfil?.hasError('required')) {
              <small class="error">La imagen de perfil es obligatoria.</small>
            }
          </div>

          <label for="imagenPerfil">
            Elegir imagen
            <input
              id="imagenPerfil"
              type="file"
              accept="image/*"
              (change)="onImageSelected($event)"
            >
          </label>
        </div>

        @if (registerError) {
          <div class="form-alert error-alert">
            {{ registerError }}
          </div>
        }

        @if (registerSuccess) {
          <div class="form-alert success-alert">
            {{ registerSuccess }}
          </div>
        }

        <div class="auth-actions">
          <button
            class="btn btn-primary"
            type="submit"
            [disabled]="registerForm.invalid"
          >
            Crear cuenta
          </button>

          <p class="auth-link">
            Â¿Ya tenÃ©s cuenta?
            <a routerLink="/login">Iniciar sesiÃ³n</a>
          </p>
        </div>
      </form>
    </article>
  </section>
</main>
~~~

## src/app/pages/register/register.scss

~~~
.register-layout {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 34px;
  align-items: start;
}

.register-copy {
  position: sticky;
  top: 112px;
}

.feature-list {
  display: grid;
  gap: 14px;
  margin-top: 34px;
}

.feature-list div {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  overflow: hidden;
}

.feature-list div::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  right: -38px;
  top: -38px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.42), transparent 70%);
}

.feature-list strong {
  display: block;
  margin-bottom: 7px;
  font-size: 16px;
}

.feature-list span {
  display: block;
  color: #aab3c5;
  line-height: 1.6;
  font-size: 14px;
}

.register-card {
  padding: 32px;
}

.register-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 26px;
}

.register-card h2 {
  margin: 0 0 8px;
  font-size: 30px;
  letter-spacing: -0.8px;
}

.register-card p {
  margin: 0;
  color: #aab3c5;
  line-height: 1.6;
}

.profile-preview {
  width: 78px;
  height: 78px;
  flex: 0 0 auto;
  border-radius: 26px;
  display: grid;
  place-items: center;
  color: #dbeafe;
  font-size: 13px;
  font-weight: 900;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.28), transparent 32%),
    linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(6, 182, 212, 0.78));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 16px 35px rgba(124, 58, 237, 0.26);
  overflow: hidden;
}

.profile-preview.has-image {
  background: rgba(255, 255, 255, 0.08);
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-helper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
  color: rgba(219, 234, 254, 0.56);
  font-size: 12px;
  font-weight: 700;
}

.upload-box {
  margin-top: 4px;
  padding: 18px;
  border: 1px dashed rgba(167, 139, 250, 0.55);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 34%),
    rgba(124, 58, 237, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: 0.22s ease;
}

.upload-box.uploaded {
  border-style: solid;
  border-color: rgba(6, 182, 212, 0.45);
  background:
    radial-gradient(circle at top left, rgba(6, 182, 212, 0.16), transparent 34%),
    rgba(255, 255, 255, 0.075);
}

.upload-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upload-box strong {
  display: block;
}

.upload-box span {
  display: block;
  color: #aab3c5;
  font-size: 14px;
  word-break: break-word;
}

.upload-box label {
  flex: 0 0 auto;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 15px;
  color: white;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #06b6d4);
  box-shadow: 0 12px 28px rgba(124, 58, 237, 0.28);
  transition: 0.2s ease;
}

.upload-box label:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(124, 58, 237, 0.38);
}

.upload-box input {
  display: none;
}

.form-alert {
  margin: 18px 0 0;
  padding: 13px 15px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.error-alert {
  color: #fecdd3;
  background: rgba(244, 63, 94, 0.13);
  border: 1px solid rgba(244, 63, 94, 0.28);
}

.success-alert {
  color: #ccfbf1;
  background: rgba(20, 184, 166, 0.13);
  border: 1px solid rgba(20, 184, 166, 0.28);
}

@media (max-width: 980px) {
  .register-layout {
    grid-template-columns: 1fr;
  }

  .register-copy {
    position: static;
  }
}

@media (max-width: 680px) {
  .register-card {
    padding: 24px;
  }

  .register-card-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .upload-box {
    align-items: stretch;
    flex-direction: column;
  }

  .upload-box label {
    text-align: center;
  }
}
~~~

## src/app/pages/register/register.ts

~~~
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
      this.registerError = 'Ese nombre de usuario ya estÃ¡ en uso.';
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
~~~

## src/app/services/auth.ts

~~~
import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class Auth 
{
  private readonly USER_KEY = 'red_social_user';

  login(usuarioOCorreo: string, password: string): boolean 
  {
    const users = this.getUsers();

    const user = users.find(u =>
        u.correo === usuarioOCorreo ||
        u.nombreUsuario === usuarioOCorreo
    );

    if (!user) 
    {
      return false;
    }

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return true;
  }

  register(user: User, password: string): boolean 
  {
    const users = this.getUsers();

    const exists = users.some(u =>
        u.correo === user.correo ||
        u.nombreUsuario === user.nombreUsuario
    );

    if (exists) 
    {
      return false;
    }

    const newUser = {
      ...user,
      id: crypto.randomUUID()
    };

    users.push(newUser);
    localStorage.setItem('red_social_users', JSON.stringify(users));
    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));

    return true;
  }

  logout(): void 
  {
    localStorage.removeItem(this.USER_KEY);
  }

  getCurrentUser(): User | null 
  {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean 
  {
    return !!this.getCurrentUser();
  }

  private getUsers(): User[] 
  {
    const users = localStorage.getItem('red_social_users');
    return users ? JSON.parse(users) : [];
  }
}
~~~

## src/app/services/users.ts

~~~
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Users {}
~~~

## src/index.html

~~~
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>RedSocialFront</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
~~~

