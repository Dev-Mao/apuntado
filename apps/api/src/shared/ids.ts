import { randomUUID } from "node:crypto";

export class RandomIds {
  next(): string {
    return randomUUID();
  }
}
