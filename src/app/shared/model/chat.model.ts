export interface ChatMessage {
  id?: number;
  anuncioId: number;
  conteudo: string;
  dataEnvio?: string;
  remetenteId: number;
  remetenteNome: string;
  destinatarioId: number;
  destinatarioNome: string;
}
