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
});
