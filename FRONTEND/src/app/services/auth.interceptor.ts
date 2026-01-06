import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("token");
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);

  if (token && isApiRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
