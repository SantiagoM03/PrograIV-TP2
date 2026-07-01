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
