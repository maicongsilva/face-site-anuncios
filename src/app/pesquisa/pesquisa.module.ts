import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PesquisaComponent } from './pesquisa.component';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    PesquisaComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports: [PesquisaComponent]
})
export class PesquisaModule { }
