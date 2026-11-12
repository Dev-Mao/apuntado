import type { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import type { ServerOptions } from "socket.io";
import type { AppConfig } from "./config.js";

class CrossOriginIoAdapter extends IoAdapter {
  constructor(
    app: INestApplication,
    private readonly origins: readonly string[],
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): ReturnType<IoAdapter["createIOServer"]> {
    return super.createIOServer(port, { ...options, cors: { origin: [...this.origins], credentials: true } } as ServerOptions);
  }
}

export const configureApp = (app: INestApplication, config: AppConfig): void => {
  app.enableShutdownHooks();
  if (config.allowedOrigins.length === 0) return;
  app.enableCors({ origin: [...config.allowedOrigins], credentials: true });
  app.useWebSocketAdapter(new CrossOriginIoAdapter(app, config.allowedOrigins));
};
