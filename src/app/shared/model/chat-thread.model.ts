export interface ChatThread {
  anuncioId: number;
  anuncioTitulo: string;
  outroUsuarioId: number;
  outroUsuarioNome: string;
  ultimoConteudo: string;
  dataUltimaMensagem: string;
  naoLidas: number;
}
