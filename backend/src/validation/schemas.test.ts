import assert from "node:assert/strict";
import test from "node:test";
import { registerSchema, loginSchema, alertTriggerSchema, diaryEntrySchema, vitalDataSchema, aiQuerySchema } from "./schemas";

test("registerSchema acepta datos válidos y normaliza email", () => {
  const parsed = registerSchema.safeParse({
    nombreUsers: "Ana Demo",
    emailUsers: "  ANA@sentinel.local ",
    contrasenaUsers: "secreta123",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.emailUsers, "ana@sentinel.local");
});

test("registerSchema rechaza email inválido y password corta", () => {
  assert.equal(registerSchema.safeParse({ nombreUsers: "A", emailUsers: "no-email", contrasenaUsers: "123" }).success, false);
  assert.equal(registerSchema.safeParse({ nombreUsers: "Ana Demo", emailUsers: "ana@x.com", contrasenaUsers: "123" }).success, false);
});

test("loginSchema exige email y password", () => {
  assert.equal(loginSchema.safeParse({ emailUsers: "", contrasenaUsers: "" }).success, false);
  assert.equal(loginSchema.safeParse({ emailUsers: "a@b.com", contrasenaUsers: "x" }).success, true);
});

test("alertTriggerSchema valida coordenadas", () => {
  assert.equal(alertTriggerSchema.safeParse({ emergenciaId: 1, latitud: 14.6, longitud: -90.5, ciudadanoId: 3 }).success, true);
  assert.equal(alertTriggerSchema.safeParse({ emergenciaId: 1, latitud: 200, longitud: -90.5, ciudadanoId: 3 }).success, false);
  assert.equal(alertTriggerSchema.safeParse({ emergenciaId: 1, latitud: 14.6, longitud: -90.5 }).success, false);
});

test("diaryEntrySchema aplica límites", () => {
  assert.equal(diaryEntrySchema.safeParse({ titulo: "Día 1", contenido: "Todo bien", userId: 1 }).success, true);
  assert.equal(diaryEntrySchema.safeParse({ titulo: "x".repeat(201), contenido: "ok", userId: 1 }).success, false);
});

test("vitalDataSchema exige idUser y valida grupo sanguíneo", () => {
  assert.equal(vitalDataSchema.safeParse({ idUser: 1 }).success, true);
  assert.equal(vitalDataSchema.safeParse({}).success, false);
  assert.equal(vitalDataSchema.safeParse({ idUser: 1, grupoSanguineo: "ZZ" }).success, false);
});

test("aiQuerySchema rechaza prompt vacío", () => {
  assert.equal(aiQuerySchema.safeParse({ userId: 1, prompt: "ayuda" }).success, true);
  assert.equal(aiQuerySchema.safeParse({ userId: 1, prompt: "   " }).success, false);
});
