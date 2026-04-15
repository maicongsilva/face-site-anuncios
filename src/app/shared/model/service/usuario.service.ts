import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { NovoUsuario } from '../../../register/novo-usuario';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NovoUsuarioService {

  apiUrl = `${environment.apiUrl}/user`;

  httpOptions = {
    headers: new HttpHeaders()
  };

  constructor(private http: HttpClient) { }

  cadastraNovoUsuario(novoUsuario: NovoUsuario): Observable<unknown> {
    return this.http.post(this.apiUrl, novoUsuario, this.httpOptions)
      .pipe(catchError((error) => this.handleError(error)));
  }

  findByDocumento(documento: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/${documento}`, this.httpOptions)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

