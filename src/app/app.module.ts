import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HomeModule } from './home/home.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginModule } from './login/login.module';
import { PesquisaModule } from './pesquisa/pesquisa.module';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileComponent } from './profile/profile.component';
import { AnuncioDetailComponent } from './anuncio-detail/anuncio-detail.component';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { AdminComponent } from './admin/admin.component';
import { ChatComponent } from './chat/chat.component';
import { MessagesComponent } from './messages/messages.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    ProfileComponent,
    AnuncioDetailComponent,
    AdminComponent,
    ChatComponent,
    MessagesComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    MatButtonToggleModule,
    MatFormFieldModule,
    MatCardModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTabsModule
  ]
})
export class AppModule { }
