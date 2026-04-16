export interface Anuncio {
  id?: number;
  titulo: string;
  descricao: string;
  categoria: string;
  localizacao: string;
  preco: number;
  imagemUrl?: string;
  favoritado?: boolean;
  totalFavoritos?: number;
  dataCriacao?: string;
  anuncianteId?: number;
  anuncianteNome?: string;
  anuncianteTelefone?: string;
  anuncianteEmail?: string;
}
