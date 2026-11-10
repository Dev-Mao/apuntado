/** Utilidad técnica compartida. Sin lógica de negocio (regla de gobernanza FF-04). */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/** Reloj fijo: hace reproducibles las pruebas del dominio. */
export class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}
  now(): Date {
    return this.instant;
  }
}
