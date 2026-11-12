import { hash, verify } from "@node-rs/argon2";
import type { PasswordHasher } from "../application/ports.js";

export class Argon2PasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return hash(password);
  }

  verify(passwordHash: string, password: string): Promise<boolean> {
    return verify(passwordHash, password);
  }
}
