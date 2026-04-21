import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  language: string;
  idCompany: number;
  userLevel: number;
  sessionId: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginUrl = environment.loginUrl;

  constructor(private http: HttpClient) {}

  signIn(credentials: { username: string; password: string; rememberMe?: boolean }): Observable<User> {
    return this.http.post<LoginResponse>(this.loginUrl, {
      username: credentials.username,
      password: credentials.password,
    }).pipe(
      map(res => {
        // Guardar solo el user en localStorage como pediste
        localStorage.setItem('user', JSON.stringify(res.user));
        // Si más adelante quieres mantener tokens también puedes guardarlos
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        return res.user;
      })
    );
  }

  getUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) as User : null;
  }

  signOut(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
