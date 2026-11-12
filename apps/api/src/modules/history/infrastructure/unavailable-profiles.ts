import type { ProfileReader } from "../application/ports.js";

export class UnavailableProfiles implements ProfileReader {
  statsOf(): Promise<null> {
    return Promise.resolve(null);
  }
}
