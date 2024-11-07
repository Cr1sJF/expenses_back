import { Application } from "express";
import Logger from "../../models/Loggers/Logger";
import swagger from "./swagger";
import Routes from "../../controllers";
const log = new Logger("ROUTES");

export default async (app: Application) => {
	try {
		log.info(`📡 LOADING ROUTES...`);
		await swagger(app);
		await Routes(app);
		log.info(`✅ ROUTES LOADED`);
	} catch (error) {
		log.error(`Error inicializando aplicacion`, error);
	}
};
