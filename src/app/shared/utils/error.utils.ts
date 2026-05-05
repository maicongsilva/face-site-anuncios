import { HttpErrorResponse } from '@angular/common/http';

export type ErrorContext = 'login' | 'register' | 'generic';

export function getErrorMessage(error: unknown, context: ErrorContext = 'generic'): string {
  if (!error) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const err = error as HttpErrorResponse;

  // Proxy / network error: status 0 OR error body is a proxy string
  if (
    err.status === 0 ||
    (typeof err.error === 'string' && err.error.toLowerCase().includes('proxy'))
  ) {
    return 'Servidor indisponível. Verifique sua conexão e tente novamente.';
  }

  // Extract a clean backend message — backend may return a plain string or an object with message
  const backendMessage: string | undefined =
    typeof err.error === 'string' && err.error.trim() !== ''
      ? err.error
      : typeof err.error?.message === 'string'
      ? err.error.message
      : undefined;

  const isBackendMessageClean =
    backendMessage &&
    !backendMessage.toLowerCase().includes('proxy') &&
    !backendMessage.toLowerCase().includes('exception') &&
    !backendMessage.toLowerCase().includes('stack');

  switch (err.status) {
    case 400:
      return isBackendMessageClean ? backendMessage! : 'Dados inválidos. Verifique as informações e tente novamente.';

    case 401:
      if (context === 'login') {
        return 'E-mail ou senha incorretos.';
      }
      return 'Sessão expirada. Faça login novamente.';

    case 403:
      return 'Você não tem permissão para realizar esta ação.';

    case 404:
      return 'Recurso não encontrado.';

    case 409:
      return isBackendMessageClean ? backendMessage! : 'Este dado já está cadastrado.';

    case 422:
      return isBackendMessageClean ? backendMessage! : 'Dados inválidos. Verifique as informações.';

    case 500:
    case 502:
    case 503:
    case 504:
      return 'Erro interno do servidor. Tente novamente mais tarde.';

    default:
      return isBackendMessageClean ? backendMessage! : 'Ocorreu um erro inesperado. Tente novamente.';
  }
}