import { HttpClient, HttpClientModule, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ResponsePageable } from "../responsePageable.model";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ItemService{

  private readonly apiUrl = `${environment.apiUrl}/itens`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  constructor(
    private httpClient: HttpClient
  ){}

    public getIntensWithFlag(flag: string): Observable<ResponsePageable>{
      return this.httpClient.get<ResponsePageable>(this.apiUrl);
    }
  }

