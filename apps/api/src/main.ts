import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { configureApp } from "./bootstrap.js";
import { loadConfig } from "./config.js";
import { openDatabase } from "./shared/database/open-database.js";

const config = loadConfig(process.env);
const logger = new Logger("Database");
const database = config.databaseUrl ? await openDatabase(config.databaseUrl, { info: (m) => logger.log(m), error: (e) => logger.error(e) }) : null;
if (!database) logger.warn("DATABASE_URL no está definida: el historial y la bitácora no se guardan");
const app = await NestFactory.create(AppModule.register(config, database));
configureApp(app, config);
await app.listen(config.port);
