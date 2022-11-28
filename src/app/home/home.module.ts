import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { AnuncioListComponent } from './anuncio-list/anuncio-list.component';


@NgModule({
  declarations: [
    HomeComponent,
    AnuncioListComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatCardModule
  ],
  exports: [
    HomeComponent
  ]

})
export class HomeModule { }
