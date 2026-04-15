import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './shared/model/service/auth.service';
import { AuthUser } from './shared/model/auth.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'face-login-siteanuncios';
  authState$: Observable<boolean> = this.authService.authState$;
  currentUser$: Observable<AuthUser | null> = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
