import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.session() ? true : inject(Router).createUrlTree(["/login"]);
};

export const roleGuard = (allowedRoles: ("USER" | "STAFF" | "ADMIN")[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.session()) return router.createUrlTree(["/login"]);
  if (!auth.hasRole(allowedRoles)) return router.createUrlTree(["/dashboard"]);
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.session()) return router.createUrlTree(["/login"]);
  if (!auth.isAdmin()) return router.createUrlTree(["/dashboard"]);
  return true;
};

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.session()) return router.createUrlTree(["/login"]);
  if (!auth.isStaff()) return router.createUrlTree(["/dashboard"]);
  return true;
};