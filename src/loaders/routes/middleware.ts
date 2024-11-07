// import httpContext from "express-http-context";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import Log from "../../models/Loggers/Logger";

const log = new Log("Middleware");
export default async (app: Application) => {
	try {
		log.info("🛜 Setting up middleware...");

		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.use(express.json({ limit: "1mb" }));
		app.use(express.urlencoded({ extended: false, limit: "1mb" }));
		app.use(cookieParser());
		app.use(
			fileUpload({
				useTempFiles: true,
				tempFileDir: "/tmp/",
			})
		);

		//Add unique ID for request
		// app.use(httpContext.middleware);

		app.use((_, res, next) => {
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Headers", "*");
			res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
			res.setHeader("Access-Control-Allow-Credentials", "true");
			next();
		});

		log.info("✅ Middleware ready...");
	} catch (error) {
		log.error("Error creando Middleware", error);
	}
};
