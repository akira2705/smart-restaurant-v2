import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { UserService } from "../services/user.service";

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

  constructor(private router: Router, private userService: UserService) {}

  async login() {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        this.email,
        this.password
      );

      const token = await cred.user.getIdToken();
      localStorage.setItem("token", token);

      const user = await firstValueFrom(this.userService.getCurrentUser());
      const role = user?.role;
      if (role) {
        localStorage.setItem("role", role);
      }

      if (role === "MANAGER") {
        this.router.navigate(["/manager"]);
      } else {
        this.router.navigate(["/reserve"]);
      }
    } catch (e) {
      this.error = "Login failed";
    }
  }
}
