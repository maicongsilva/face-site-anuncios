import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/model/service/auth.service';
import { getErrorMessage } from '../shared/utils/error.utils';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  email = '';
  token = '';
  novaSenha = '';
  confirmacaoSenha = '';
  loading = false;
  message = '';
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  requestToken(): void {
    this.message = '';
    this.success = false;

    if (!this.email.trim()) {
      this.message = 'Informe o e-mail da conta para receber a redefinição.';
      return;
    }

    this.loading = true;
    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        this.message = response.message || 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.';
        if (response.token) {
          this.token = response.token;
          this.message = 'Código recebido com sucesso. Agora escolha sua nova senha abaixo.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.message = getErrorMessage(error, 'reset-password');
      }
    });
  }

  submit(): void {
    this.message = '';
    this.success = false;

    if (!this.token.trim()) {
      this.message = 'Digite o código recebido por e-mail para continuar.';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.message = 'A nova senha deve ter pelo menos 6 caracteres.';
      return;
    }

    if (this.novaSenha !== this.confirmacaoSenha) {
      this.message = 'As senhas informadas não coincidem.';
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.token, this.novaSenha).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        this.message = response.message || 'Senha redefinida com sucesso.';
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (error) => {
        this.loading = false;
        this.message = getErrorMessage(error, 'reset-password');
      }
    });
  }
}
