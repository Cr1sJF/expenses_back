import * as db from "../models/DB";
import Logger from "../models/Loggers/Logger";
const log = new Logger("BD_CONECTOR");

export default async () => {
	try {
		log.db("INITIALIZING DB...");
		await db.init();

		log.db("AUTHENTICATING...");
		await db.authenticate();
		log.db("✅ DB CONNECTED");
	} catch (error) {
		log.error("Error inicializando BD", error);
	}
};
