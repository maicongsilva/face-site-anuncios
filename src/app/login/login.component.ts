import { Component, OnInit } from '@angular/core';

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


  constructor() { }

  ngOnInit() {
  }
  trylogin(uname: string, pass: string)
  {
    console.log(uname+" "+pass)
    if(uname === this.username && pass === this.password) {
      this.message = "Login Successfull"
    }else {
      this.message = "Invalid Credentials"
    }
  }

}
