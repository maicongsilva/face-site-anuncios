export interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  documento?: string | null;
  telefone?: string | null;
}
