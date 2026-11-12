export class OriginPolicy {
  constructor(private readonly extraOrigins: readonly string[] = []) {}

  allows(origin: string | undefined, host: string | undefined): boolean {
    if (!origin) return true;
    if (this.extraOrigins.includes(origin)) return true;
    return URL.canParse(origin) && host !== undefined && new URL(origin).host === host;
  }
}
