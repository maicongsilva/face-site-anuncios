export interface Anuncio {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  localizacao: string;
  preco: number;
  imagemUrl?: string;
  imagens?: string[];
  favoritado?: boolean;
  totalFavoritos?: number;
  dataCriacao?: string;
  anuncianteId?: number;
  anuncianteNome?: string;
  anuncianteTelefone?: string;
  anuncianteEmail?: string;
}

export interface AnuncioPage {
  content: Anuncio[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
