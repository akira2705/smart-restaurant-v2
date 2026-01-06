import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  email = "";
  password = "";
  error = "";

  constructor(private router: Router) {}

  async login() {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        this.email,
        this.password
      );

      const token = await cred.user.getIdToken();
      localStorage.setItem("token", token);

      this.router.navigate(["/reserve"]);
    } catch (e) {
      this.error = "Login failed";
    }
  }
}
