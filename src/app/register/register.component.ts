import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  constructor(private formbuilder:FormBuilder,private router:Router) { }

  ngOnInit() {
    this.registerForm = this.formbuilder.group({
      email : ['',[Validators.required]],
      password : ['',[Validators.required]],
      uname : ['',Validators.required]
    })
  }
  register()
  {
    this.message="Registered successfully "
  }

}
