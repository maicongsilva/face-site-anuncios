import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, MatSnackBarModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('cria o componente com o formulário válido para os campos de localização', () => {
    expect(component).toBeTruthy();
    expect(component.anuncioForm.controls.cidade.errors).toEqual({ required: true });
  });

  it('aceita cidade digitada quando a lista do IBGE falha', () => {
    component.cidadesErro = 'falha';
    component.anuncioForm.controls.cidade.setValue('Qualquer Cidade');
    expect(component.anuncioForm.controls.cidade.errors).toBeNull();
  });

  it('rejeita cidade fora da lista quando ela foi carregada', () => {
    component.cidades = ['São Paulo'];
    component.anuncioForm.controls.cidade.setValue('Xyz');
    expect(component.anuncioForm.controls.cidade.hasError('cidadeInvalida')).toBeTrue();
    component.anuncioForm.controls.cidade.setValue('sao paulo');
    expect(component.anuncioForm.controls.cidade.errors).toBeNull();
  });

  describe('autocomplete de cidade', () => {
    beforeEach(() => {
      component.cidades = ['São Paulo', 'Santos', 'Campinas'];
    });

    it('filtra ignorando acento e maiúsculas', () => {
      component.anuncioForm.controls.cidade.setValue('SAO');
      component.filtrarCidades();
      expect(component.cidadesFiltradas).toEqual(['São Paulo']);
    });

    it('mostra todas as cidades com o campo vazio', () => {
      component.anuncioForm.controls.cidade.setValue('');
      component.filtrarCidades();
      expect(component.cidadesFiltradas.length).toBe(3);
    });

    it('limita a 100 opções', () => {
      component.cidades = Array.from({ length: 300 }, (_, i) => `Cidade ${i}`);
      component.anuncioForm.controls.cidade.setValue('');
      component.filtrarCidades();
      expect(component.cidadesFiltradas.length).toBe(100);
    });
  });

  describe('fotos', () => {
    const arquivo = (nome: string, tipo = 'image/png') => new File(['x'], nome, { type: tipo });
    const evento = (files: File[]) => ({ target: { files, value: 'x' } } as unknown as Event);

    it('remove uma foto nova e sua prévia juntas', () => {
      component.selectedGalleryFiles = [arquivo('a.png'), arquivo('b.png')];
      component.previewImages = ['pa', 'pb'];
      component.removerImagemNova(0);
      expect(component.selectedGalleryFiles.map((f) => f.name)).toEqual(['b.png']);
      expect(component.previewImages).toEqual(['pb']);
    });

    it('reordena fotos novas mantendo arquivo e prévia alinhados', () => {
      component.selectedGalleryFiles = [arquivo('a.png'), arquivo('b.png')];
      component.previewImages = ['pa', 'pb'];
      component.moverImagemNova(0, 1);
      expect(component.selectedGalleryFiles.map((f) => f.name)).toEqual(['b.png', 'a.png']);
      expect(component.previewImages).toEqual(['pb', 'pa']);
    });

    it('remove foto existente e atualiza a principal', () => {
      component.existingImages = ['/u/1.jpg', '/u/2.jpg'];
      component.removerImagemExistente(0);
      expect(component.existingImages).toEqual(['/u/2.jpg']);
      expect(component.currentImageUrl).toBe('/u/2.jpg');
    });

    it('bloqueia quando o total passa de 6 fotos', async () => {
      component.existingImages = ['1', '2', '3', '4', '5'];
      await component.onImageSelected(evento([arquivo('a.png'), arquivo('b.png')]));
      expect(component.selectedGalleryFiles.length).toBe(0);
      expect(component.feedback).toContain('Limite');
    });

    it('rejeita formato não suportado', async () => {
      await component.onImageSelected(evento([arquivo('a.pdf', 'application/pdf')]));
      expect(component.selectedGalleryFiles.length).toBe(0);
      expect(component.feedback).toContain('Formato');
    });
  });
});
