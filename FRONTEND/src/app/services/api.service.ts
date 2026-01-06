import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  getAuthHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
  }
}
