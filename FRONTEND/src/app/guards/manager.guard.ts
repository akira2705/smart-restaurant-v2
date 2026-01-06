import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { UserService } from "../services/user.service";

export const managerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  const token = localStorage.getItem("token");
  if (!token) {
    router.navigate(["/login"]);
    return false;
  }

  const storedRole = localStorage.getItem("role");
  if (storedRole) {
    if (storedRole === "MANAGER") {
      return true;
    }
    router.navigate(["/reserve"]);
    return false;
  }

  return userService.getCurrentUser().pipe(
    map((user) => {
      const role = user?.role;
      if (role) {
        localStorage.setItem("role", role);
      }
      if (role === "MANAGER") {
        return true;
      }
      router.navigate(["/reserve"]);
      return false;
    }),
    catchError(() => {
      router.navigate(["/login"]);
      return of(false);
    })
  );
};
