import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NovoUsuarioService } from '../shared/model/service/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username ='admin';
  password = 'admin';
  LoginComponent: any;
  message: string = "";


  constructor(private novoUsuarioService:NovoUsuarioService) { }

  ngOnInit() {
  }

  trylogin(uname: string, pass: string){
    console.log(uname);
    console.log(this.novoUsuarioService.login(uname,pass));
    if(uname === this.username && pass === this.password) {
      this.message = "Login Successfull"
    }else {
      this.message = "Invalid Credentials"
    }
  }

}
