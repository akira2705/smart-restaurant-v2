import { LoginComponent } from "./login/login.component";

const routes = [
  { path: "login", component: LoginComponent },
  { path: "", redirectTo: "login", pathMatch: "full" },
];
