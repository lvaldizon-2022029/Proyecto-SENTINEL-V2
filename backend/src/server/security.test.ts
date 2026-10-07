import assert from "node:assert/strict";
import test, { after } from "node:test";
import request from "supertest";
import { app } from "./server";
import { databaseStore } from "../services/store";

after(async () => {
  await databaseStore?.close();
});

async function adminToken() {
  const email = `sec-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  await request(app).post("/Sentinel/Auth/register").send({
    nombreUsers: "Seguridad",
    emailUsers: email,
    contrasenaUsers: "secreta123",
    rolUsers: "ADMIN",
  });
  const login = await request(app).post("/Sentinel/Auth/login").send({ emailUsers: email, contrasenaUsers: "secreta123" });
  assert.equal(login.status, 200);
  return login.body.token as string;
}

test("rutas protegidas exigen JWT", async () => {
  const denied = await request(app).get("/Sentinel/Users");
  assert.equal(denied.status, 401);
  assert.ok(denied.body.error);
});

test("rol insuficiente devuelve 403", async () => {
  const email = `user-${Date.now()}@example.com`;
  await request(app).post("/Sentinel/Auth/register").send({
    nombreUsers: "Usuario base",
    emailUsers: email,
    contrasenaUsers: "secreta123",
    rolUsers: "USER",
  });
  const login = await request(app).post("/Sentinel/Auth/login").send({ emailUsers: email, contrasenaUsers: "secreta123" });
  const res = await request(app).get("/Sentinel/Users").set("Authorization", `Bearer ${login.body.token}`);
  assert.equal(res.status, 403);
});

test("register valida formato y no expone trazas", async () => {
  const res = await request(app).post("/Sentinel/Auth/register").send({
    nombreUsers: "A",
    emailUsers: "no-email",
    contrasenaUsers: "123",
  });
  assert.equal(res.status, 400);
  assert.ok(typeof res.body.error === "string");
  assert.equal("stack" in res.body, false);
});

test("login con credenciales inválidas devuelve 401 sin detalles internos", async () => {
  const res = await request(app).post("/Sentinel/Auth/login").send({ emailUsers: "nadie@x.com", contrasenaUsers: "xxx" });
  assert.equal(res.status, 401);
  assert.equal("stack" in res.body, false);
});

test("disparar alerta valida coordenadas", async () => {
  const token = await adminToken();
  const res = await request(app)
    .post("/Sentinel/Alertas/disparar")
    .set("Authorization", `Bearer ${token}`)
    .send({ emergenciaId: 1, latitud: 500, longitud: 0, ciudadanoId: 1 });
  assert.equal(res.status, 400);
});

test("ruta inexistente devuelve 404 JSON", async () => {
  const res = await request(app).get("/Sentinel/no-existe-xyz");
  assert.equal(res.status, 404);
  assert.equal(res.body.error, "Recurso no encontrado");
});

test("respuestas incluyen cabeceras de seguridad básicas", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.ok(res.headers["x-content-type-options"] || res.headers["x-dns-prefetch-control"] || res.headers["x-frame-options"]);
});

test("límite de tamaño rechaza JSON gigante sin trazas", async () => {
  const token = await adminToken();
  const res = await request(app)
    .post("/Sentinel/Diario/guardar")
    .set("Authorization", `Bearer ${token}`)
    .send({ titulo: "t", contenido: "x".repeat(2 * 1024 * 1024), userId: 1 });
  assert.ok([400, 413, 500].includes(res.status));
  assert.equal("stack" in (res.body ?? {}), false);
});
