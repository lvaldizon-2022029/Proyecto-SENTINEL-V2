import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { retry } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const raw = localStorage.getItem("sentinel-session");
  let authorizedRequest = request;

  if (raw) {
    try {
      const session = JSON.parse(raw) as { token?: string };
      if (session.token) {
        authorizedRequest = request.clone({
          setHeaders: { Authorization: `Bearer ${session.token}` }
        });
      }
    } catch {
      localStorage.removeItem("sentinel-session");
    }
  }

  const response = next(authorizedRequest);
  return request.method === "GET"
    ? response.pipe(
        retry({
          count: 5,
          delay: (error: HttpErrorResponse, attempt) => {
            if (error.status !== 0) throw error;
            return new Promise<void>((resolve) => setTimeout(resolve, (attempt + 1) * 500));
          }
        })
      )
    : response;
};
