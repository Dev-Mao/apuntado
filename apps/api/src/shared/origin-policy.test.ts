import { describe, expect, it } from "vitest";
import { OriginPolicy } from "./origin-policy.js";

describe("Política de origen", () => {
  const policy = new OriginPolicy(["http://localhost:3001"]);

  it("acepta el mismo origen y las peticiones sin origen, que no vienen de un navegador", () => {
    expect(policy.allows("https://apuntado.onrender.com", "apuntado.onrender.com")).toBe(true);
    expect(policy.allows(undefined, "apuntado.onrender.com")).toBe(true);
  });

  it("rechaza otro sitio y un origen mal formado", () => {
    expect(policy.allows("https://evil.example", "apuntado.onrender.com")).toBe(false);
    expect(policy.allows("no es una url", "apuntado.onrender.com")).toBe(false);
  });

  it("acepta los orígenes adicionales configurados", () => {
    expect(policy.allows("http://localhost:3001", "localhost:3000")).toBe(true);
  });
});
