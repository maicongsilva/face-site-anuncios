import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { NovoUsuarioService } from '../shared/model/service/usuario.service';
import { NovoUsuario } from './novo-usuario';

/** Error when invalid control is dirty, touched, or submitted. */
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

  email = new FormControl('', [Validators.required, Validators.email]);
  matcher = new MyErrorStateMatcher();
  hide = true;
  successmessage=null;
  errormessage=null;
  message: string = "";
  constructor(
    private formbuilder:FormBuilder,
    private router:Router,
    private novoUsuarioService:NovoUsuarioService
    ) { }

  ngOnInit() {
  }

  registerForm = new FormGroup({
    nome: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', Validators.required)
  });

  onSubmit() {
    const formData = this.registerForm.value;
    console.log(formData);
    this.novoUsuarioService.cadastraNovoUsuario(formData);
  }
  
  //register(){
  //  console.log(this.registerForm);
  //  const novoUsuario = this.registerForm.getRawValue() as NovoUsuario;
  //  this.novoUsuarioService.cadastraNovoUsuario(novoUsuario);
  //  console.log("Registered successfully");
  //  this.message="Registered successfully "
  //}

}
