import { HttpClient, HttpClientModule, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ResponsePageable } from "../responsePageable.model";

@Injectable({
  providedIn: 'root'
})

export class ItemService{

  apiUrl = 'http://localhost:8080/itens'

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'aplication/json'
    })
  };
  constructor(
    private httpClient: HttpClient
  ){}

    public getIntensWithFlag(flag: string): Observable<ResponsePageable>{
      return this.httpClient.get<ResponsePageable>(this.apiUrl);
    }
  }

