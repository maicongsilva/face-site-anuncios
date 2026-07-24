import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './error.utils';

describe('getErrorMessage', () => {
  it('should map duplicate register messages to a friendly text', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: 'Usuario com nome: Maicon Gomes da silva ja existe.'
    });

    expect(getErrorMessage(error, 'register')).toBe('Já existe um usuário com esse nome.');
  });

  it('should keep login errors unchanged for 400 backend messages', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: 'Credenciais inválidas.'
    });

    expect(getErrorMessage(error, 'login')).toBe('Credenciais inválidas.');
  });

  it('should show a friendly login message for server errors', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: 'Internal Server Error'
    });

    expect(getErrorMessage(error, 'login')).toBe('Não foi possível entrar agora. Tente novamente em instantes.');
  });

  it('should show a friendly register message for server errors', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: 'Internal Server Error'
    });

    expect(getErrorMessage(error, 'register')).toBe('Não foi possível concluir o cadastro agora. Tente novamente em instantes.');
  });
});
