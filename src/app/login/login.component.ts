import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/model/service/auth.service';
import { getErrorMessage } from '../shared/utils/error.utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  message = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/minha-conta']);
    }
  }

  trylogin(email: string, senha: string): void {
    this.message = '';
    this.loading = true;

    this.authService.login({ email, senha }).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Login realizado com sucesso.';
        this.router.navigate(['/minha-conta']);
      },
      error: (error) => {
        this.loading = false;
        this.message = getErrorMessage(error, 'login');
      }
    });
  }
}
