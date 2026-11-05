import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { AnuncioListComponent } from './anuncio-list.component';

describe('AnuncioListComponent', () => {
  let component: AnuncioListComponent;
  let fixture: ComponentFixture<AnuncioListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ AnuncioListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnuncioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
