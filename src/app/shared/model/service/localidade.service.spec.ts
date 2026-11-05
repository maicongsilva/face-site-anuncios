import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ESTADOS_BR, formatLocalizacao, LocalidadeService, parseLocalizacao } from './localidade.service';

describe('LocalidadeService', () => {
  let service: LocalidadeService;
  let http: HttpTestingController;
  const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios?orderBy=nome';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(LocalidadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista os 27 estados', () => {
    expect(ESTADOS_BR.length).toBe(27);
  });

  it('retorna apenas os nomes dos municípios e reaproveita o cache', () => {
    let primeira: string[] = [];
    let segunda: string[] = [];
    service.listarMunicipios('SP').subscribe((nomes) => (primeira = nomes));
    http.expectOne(url).flush([{ nome: 'Campinas' }, { nome: 'São Paulo' }]);
    service.listarMunicipios('SP').subscribe((nomes) => (segunda = nomes));
    http.expectNone(url);

    expect(primeira).toEqual(['Campinas', 'São Paulo']);
    expect(segunda).toEqual(primeira);
  });

  it('não guarda falhas em cache e permite nova tentativa', () => {
    let falhou = false;
    service.listarMunicipios('SP').subscribe({ error: () => (falhou = true) });
    http.expectOne(url).flush('erro', { status: 500, statusText: 'Server Error' });
    expect(falhou).toBeTrue();

    service.listarMunicipios('SP').subscribe();
    http.expectOne(url).flush([]);
  });

  it('formata e interpreta "Cidade, UF"', () => {
    expect(formatLocalizacao('Campinas', 'SP')).toBe('Campinas, SP');
    expect(parseLocalizacao('Campinas, SP')).toEqual({ cidade: 'Campinas', uf: 'SP' });
    expect(parseLocalizacao('Campinas,sp')).toEqual({ cidade: 'Campinas', uf: 'SP' });
  });

  it('retorna null para valores fora do formato', () => {
    expect(parseLocalizacao('Remoto')).toBeNull();
    expect(parseLocalizacao('Campinas, XX')).toBeNull();
    expect(parseLocalizacao('')).toBeNull();
    expect(parseLocalizacao(null)).toBeNull();
  });
});
