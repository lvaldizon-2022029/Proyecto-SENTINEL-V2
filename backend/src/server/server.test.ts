import assert from "node:assert/strict";
import test, { after } from "node:test";
import request from "supertest";
import { app } from "./server";
import { databaseStore } from "../services/store";

after(async () => {
  await databaseStore?.close();
});

test("health endpoint is available", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("registration and login preserve the compatible auth contract", async () => {
  const email = `test-${Date.now()}@example.com`;
  const registration = await request(app).post("/Sentinel/Auth/register").send({
    nombreUsers: "Usuario de prueba",
    emailUsers: email,
    contrasenaUsers: "secret"
  });
  assert.equal(registration.status, 201);

  const login = await request(app).post("/Sentinel/Auth/login").send({ emailUsers: email, contrasenaUsers: "secret" });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
});

test("legacy operational endpoints remain available", async () => {
  const email = `ops-${Date.now()}@example.com`;
  const registration = await request(app).post("/Sentinel/Auth/register").send({
    nombreUsers: "Operador de pruebas",
    emailUsers: email,
    contrasenaUsers: "secret",
    rolUsers: "ADMIN"
  });

  test("database collections expose legacy fields and relationships", async () => {
    const email = `reader-${Date.now()}@example.com`;
    await request(app).post("/Sentinel/Auth/register").send({
      nombreUsers: "Lector de pruebas",
      emailUsers: email,
      contrasenaUsers: "secret",
      rolUsers: "ADMIN"
    });
    const login = await request(app).post("/Sentinel/Auth/login").send({ emailUsers: email, contrasenaUsers: "secret" });
    assert.equal(login.status, 200);
    const token = login.body.token as string;
    const [alerts, stations, emergencies] = await Promise.all([
      request(app).get("/Sentinel/Alertas").set("Authorization", `Bearer ${token}`),
      request(app).get("/Sentinel/Estaciones").set("Authorization", `Bearer ${token}`),
      request(app).get("/Sentinel/CatalogoEmergencias").set("Authorization", `Bearer ${token}`)
    ]);
    assert.equal(alerts.status, 200);
    assert.equal(stations.status, 200);
    assert.equal(emergencies.status, 200);
    assert.ok(Array.isArray(alerts.body));
    assert.ok(Array.isArray(stations.body));
    assert.ok(Array.isArray(emergencies.body));
  });
  assert.equal(registration.status, 201);
  const login = await request(app).post("/Sentinel/Auth/login").send({
    emailUsers: email,
    contrasenaUsers: "secret"
  });
  assert.equal(login.status, 200);
  const token = login.body.token as string;

  const stationsCheck = await request(app)
    .get("/Sentinel/Estaciones/check")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(stationsCheck.status, 200);

  const ai = await request(app)
    .post("/Sentinel/AI/consultar")
    .send({ userId: 1, prompt: "¿Qué debo hacer ante una emergencia?" });
  assert.ok([200, 502].includes(ai.status));
  if (ai.status === 200) assert.ok(ai.body.respuesta);
});
