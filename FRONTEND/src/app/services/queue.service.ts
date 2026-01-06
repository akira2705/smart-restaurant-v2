import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private baseUrl = environment.apiBaseUrl + '/api/queue';

  constructor(private http: HttpClient) {}

  // GET /api/queue
  getQueue(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  // GET /api/queue/length
  getQueueLength(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/length`);
  }

  // POST /api/queue/join
  joinQueue(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/join`,
      data
    );
  }

  // POST /api/queue/leave
  leaveQueue(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/leave`, data);
  }

  // PUT /api/queue/seat
  seatCustomer(data: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/seat`,
      data
    );
  }
}
