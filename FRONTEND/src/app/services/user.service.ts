import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.apiBaseUrl + '/api/users';

  constructor(private http: HttpClient) {}

  // POST /api/users
  createUser(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl,
      data
    );
  }

  // GET /api/users/:id
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/${id}`
    );
  }

}
