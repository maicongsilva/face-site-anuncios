export interface Anuncio {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  localizacao: string;
  preco: number;
  imagemUrl?: string;
  dataCriacao?: string;
  anuncianteId?: number;
  anuncianteNome?: string;
}
