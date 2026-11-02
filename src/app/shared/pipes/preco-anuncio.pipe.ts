import { Pipe, PipeTransform } from '@angular/core';
import { TipoCobranca } from '../model/anuncio.model';

@Pipe({
  name: 'precoAnuncio',
  standalone: true
})
export class PrecoAnuncioPipe implements PipeTransform {
  private readonly unidades: Record<TipoCobranca, string> = {
    UNICO: '',
    HORA: ' / hora',
    DIA: ' / dia',
    MES: ' / mês',
    PROJETO: ' / projeto'
  };

  transform(preco: number | null | undefined, tipoCobranca?: TipoCobranca): string {
    if (preco === null || preco === undefined || !Number.isFinite(preco)) {
      return '';
    }

    const valor = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
    const unidade = tipoCobranca ? this.unidades[tipoCobranca] : '';

    return `${valor}${unidade}`;
  }
}
