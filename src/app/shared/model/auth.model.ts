export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  documento?: string;
  telefone?: string;
  role?: string;
  dataCriacaoUsuario?: string;
  dataUltimoAcesso?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
