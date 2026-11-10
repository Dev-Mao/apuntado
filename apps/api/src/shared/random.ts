/** Fuente de aleatoriedad inyectable: con semilla fija, toda partida es reproducible. */
export interface RandomSource {
  next(): number;
}

export class SystemRandom implements RandomSource {
  next(): number {
    return Math.random();
  }
}

/** Generador congruencial lineal determinista, para pruebas. */
export class SeededRandom implements RandomSource {
  constructor(private seed: number) {}
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}
