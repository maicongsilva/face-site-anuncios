import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NovoUsuarioService } from '../shared/model/service/usuario.service';
import { NovoUsuario } from './novo-usuario';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  successmessage=null;
  errormessage=null;
  message: string = "";
  constructor(
    private formbuilder:FormBuilder,
    private router:Router,
    private novoUsuarioService:NovoUsuarioService
    ) { }

  ngOnInit() {
    this.registerForm = this.formbuilder.group({
      nome:[''],
      email:['',[Validators.required]],
      usuario:[''],
      telefone:[''],
      dataNasc:[''],
      documento:[''],
      senha:['',[Validators.required]],
    })
  }

  register(){
    const novoUsuario = this.registerForm.getRawValue() as NovoUsuario;
    this.novoUsuarioService.cadastraNovoUsuario(novoUsuario);
    console.log("Registered successfully");
    this.message="Registered successfully "
  }

}
