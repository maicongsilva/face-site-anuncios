import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/model/service/auth.service';
import { NovoUsuario } from './novo-usuario';
import { getErrorMessage } from '../shared/utils/error.utils';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  matcher = new MyErrorStateMatcher();
  hide = true;
  loading = false;
  successmessage: string | null = null;
  errormessage: string | null = null;

  registerForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(5)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
    documento: new FormControl(''),
    telefone: new FormControl('')
  });

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
  }

  get emailControl(): FormControl {
    return this.registerForm.get('email') as FormControl;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = this.registerForm.getRawValue() as NovoUsuario;
    this.successmessage = null;
    this.errormessage = null;
    this.loading = true;

    this.authService.register(formData).subscribe({
      next: () => {
        this.loading = false;
        this.successmessage = 'Cadastro realizado com sucesso.';
        this.router.navigate(['/minha-conta']);
      },
      error: (error) => {
        this.loading = false;
        this.errormessage = getErrorMessage(error, 'register');
      }
    });
  }
}
