import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { configureApp } from "./bootstrap.js";
import { loadConfig } from "./config.js";

const config = loadConfig(process.env);
const app = await NestFactory.create(AppModule.register(config));
configureApp(app, config);
await app.listen(config.port);
