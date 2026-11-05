import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../model/service/auth.service';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: { getToken: () => 'abc' } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('envia o token para a própria API', () => {
    http.get('/api/anuncios').subscribe();
    const req = controller.expectOne('/api/anuncios');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush([]);
  });

  it('não envia o token para URLs externas', () => {
    http.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios').subscribe();
    const req = controller.expectOne((r) => r.url.includes('ibge.gov.br'));
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });
});
