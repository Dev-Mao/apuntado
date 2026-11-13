import { describe, expect, it } from "vitest";
import { abstractnessOf, distanceOf, zoneOf } from "../../tools/metrics/abstractness.js";
import { couplingBy } from "../../tools/metrics/coupling.js";

const folderOf = (path: string) => path.slice(0, path.lastIndexOf("/"));

describe("Fórmulas de las métricas de Martin", () => {
  it("Ca cuenta archivos externos que dependen del componente y Ce archivos propios que dependen de fuera", () => {
    const coupling = couplingBy(
      [
        { from: "app/a.ts", to: "core/x.ts" },
        { from: "app/a.ts", to: "core/y.ts" },
        { from: "app/b.ts", to: "core/x.ts" },
        { from: "core/x.ts", to: "core/y.ts" },
      ],
      ["app", "core"],
      folderOf,
    );
    expect(coupling.get("core")).toEqual({ afferent: 2, efferent: 0, instability: 0 });
    expect(coupling.get("app")).toEqual({ afferent: 0, efferent: 2, instability: 1 });
  });

  it("A es la proporción de declaraciones abstractas y D la distancia a A + I = 1", () => {
    expect(abstractnessOf({ abstract: 1, concrete: 3 })).toBe(0.25);
    expect(abstractnessOf({ abstract: 0, concrete: 0 })).toBe(0);
    expect(distanceOf(0.25, 0.75)).toBe(0);
    expect(distanceOf(0, 0)).toBe(1);
  });

  it("clasifica las esquinas como zona de dolor e inutilidad y la diagonal como secuencia principal", () => {
    expect(zoneOf(0, 0)).toBe("DOLOR");
    expect(zoneOf(1, 1)).toBe("INUTILIDAD");
    expect(zoneOf(0.5, 0.5)).toBe("SECUENCIA");
    expect(zoneOf(0.1, 0.4)).toBe("INTERMEDIA");
  });
});
