import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { RoutingModule } from './routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule} from '@angular/material/button';
import { HomeModule } from './home/home.module';
import { HttpClientModule } from '@angular/common/http'
import { LoginModule } from './login/login.module';
import { PesquisaModule } from './pesquisa/pesquisa.module';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule({
    declarations: [
        AppComponent,
        RegisterComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RoutingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatSlideToggleModule,
        HomeModule,
        MatToolbarModule,
        MatButtonModule,
        HttpClientModule,
        LoginModule,
        PesquisaModule,
        MatInputModule,
        MatIconModule,
        MatButtonToggleModule
      ]
})
export class AppModule { }
