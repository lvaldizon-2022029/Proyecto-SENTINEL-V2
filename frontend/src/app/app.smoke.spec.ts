import { describe, expect, it } from "vitest";
import { routes } from "./app.routes";
import { NotFoundComponent } from "./pages/not-found/not-found.component";

describe("SENTINEL routing", () => {
  it("defines the login and protected dashboard routes", () => {
    expect(routes.some((route) => route.path === "login")).toBe(true);
    expect(routes.some((route) => route.path === "dashboard" && route.canActivate?.length)).toBe(true);
  });

  it("exposes a dedicated not-found page instead of a blind redirect", () => {
    expect(routes.some((route) => route.path === "not-found" && route.component === NotFoundComponent)).toBe(true);
    const wildcard = routes.find((route) => route.path === "**");
    expect(wildcard?.component).toBe(NotFoundComponent);
  });

  it("protects admin and staff routes with role guards", () => {
    expect(routes.some((route) => route.path === "usuarios" && route.canActivate?.length)).toBe(true);
    expect(routes.some((route) => route.path === "despachos" && route.canActivate?.length)).toBe(true);
  });
});
