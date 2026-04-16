import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthResponse, AuthUser, UpdateProfilePayload } from '../auth.model';
import { NovoUsuario } from '../../../register/novo-usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'site-anuncios-token';
  private readonly userKey = 'site-anuncios-user';
  private readonly apiUrl = environment.apiUrl;

  private authStateSubject = new BehaviorSubject<boolean>(this.hasToken());
  readonly authState$ = this.authStateSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (this.hasToken() && !this.currentUserSubject.value) {
      this.fetchMe().subscribe({
        error: () => this.logout(false)
      });
    }
  }

  login(credentials: { email: string; senha: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  register(payload: NovoUsuario): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  fetchMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.authStateSubject.next(true);
      })
    );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<AuthUser> {
    return this.http.put<AuthUser>(`${this.apiUrl}/user/me`, payload).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(redirect = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authStateSubject.next(false);
    this.currentUserSubject.next(null);

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.authStateSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): AuthUser | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) as AuthUser : null;
  }
}
