import { describe, expect, it } from "vitest";
import { routes } from "./app.routes";

describe("SENTINEL routing", () => {
  it("defines the login and protected dashboard routes", () => {
    expect(routes.some((route) => route.path === "login")).toBe(true);
    expect(routes.some((route) => route.path === "dashboard" && route.canActivate?.length)).toBe(true);
  });
});
