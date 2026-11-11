import type { Clock } from "./clock.js";

export class ManualClock implements Clock {
  constructor(private instant = new Date("2026-11-10T12:00:00Z")) {}

  now(): Date {
    return this.instant;
  }

  advance(seconds: number): void {
    this.instant = new Date(this.instant.getTime() + seconds * 1000);
  }
}
