import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("Configuración del servidor", () => {
  it("en producción exige la clave de sesión y usa cookies seguras", () => {
    expect(() => loadConfig({ NODE_ENV: "production" })).toThrow("SESSION_SECRET is required in production");
    expect(loadConfig({ NODE_ENV: "production", SESSION_SECRET: "s" }).secureCookies).toBe(true);
  });

  it("en desarrollo funciona sin variables y sin cookies seguras", () => {
    const config = loadConfig({});
    expect(config.port).toBe(3000);
    expect(config.secureCookies).toBe(false);
  });

  it("en desarrollo acepta por defecto la interfaz en el puerto 3001; en producción, solo el propio origen", () => {
    expect(loadConfig({}).allowedOrigins).toEqual(["http://localhost:3001"]);
    expect(loadConfig({ NODE_ENV: "production", SESSION_SECRET: "s" }).allowedOrigins).toEqual([]);
    expect(loadConfig({ ALLOWED_ORIGINS: "https://a.example, https://b.example" }).allowedOrigins).toEqual([
      "https://a.example",
      "https://b.example",
    ]);
  });

  it("toma el puerto del entorno e ignora una carpeta web inexistente", () => {
    const config = loadConfig({ PORT: "8080", WEB_DIR: "no-existe" });
    expect(config.port).toBe(8080);
    expect(config.webDir).toBeNull();
  });
});
