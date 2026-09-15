import { HttpErrorResponse } from '@angular/common/http';

export type ErrorContext = 'login' | 'register' | 'generic';

export function getErrorMessage(error: unknown, context: ErrorContext = 'generic'): string {
  if (!error) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const err = error as HttpErrorResponse;

  const backendMessage = extractBackendMessage(err.error);

  // Proxy / network error: status 0 OR error body is a proxy string
  if (
    err.status === 0 ||
    (typeof err.error === 'string' && err.error.toLowerCase().includes('proxy'))
  ) {
    return 'Servidor indisponível. Verifique sua conexão e tente novamente.';
  }

  const isBackendMessageClean =
    backendMessage &&
    !backendMessage.toLowerCase().includes('proxy') &&
    !backendMessage.toLowerCase().includes('exception') &&
    !backendMessage.toLowerCase().includes('stack');

  const isDuplicateUserMessage =
    context === 'register' &&
    !!backendMessage &&
    /\b(já|ja)\s+existe\b/i.test(backendMessage);

  if (isDuplicateUserMessage) {
    return 'Já existe um usuário com esse nome.';
  }

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
      if (context === 'login') {
        return 'Não foi possível entrar agora. Tente novamente em instantes.';
      }
      if (context === 'register') {
        return 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.';
      }
      return 'Erro interno do servidor. Tente novamente mais tarde.';

    default:
      return isBackendMessageClean ? backendMessage! : 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

function extractBackendMessage(errorBody: unknown): string | undefined {
  if (typeof errorBody === 'string') {
    return errorBody.trim() || undefined;
  }

  if (Array.isArray(errorBody)) {
    const messages = errorBody
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (item && typeof item === 'object') {
          const candidate = (item as { defaultMessage?: unknown; message?: unknown }).defaultMessage
            ?? (item as { defaultMessage?: unknown; message?: unknown }).message;

          return typeof candidate === 'string' ? candidate.trim() : '';
        }

        return '';
      })
      .filter(Boolean);

    return messages.length ? messages.join(' | ') : undefined;
  }

  if (errorBody && typeof errorBody === 'object') {
    const candidate = (errorBody as { message?: unknown }).message;
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}