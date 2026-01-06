import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private api = `${environment.apiBaseUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  getReservations() {
    return this.http.get<any[]>(this.api);
}

  createReservation(data: any) {
    return this.http.post(this.api, data);
  }

  confirmReservation(id: number) {
    return this.http.post(`${this.api}/${id}/confirm`, {});
  }
  cancelReservation(id: number) {
    return this.http.post(`${this.api}/${id}/cancel`, {});
}

}
