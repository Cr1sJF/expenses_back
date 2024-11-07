// import httpContext from "express-http-context";
import fs from "fs";
import path from "path";
import { Model, ModelCtor, Sequelize } from "sequelize-typescript";
import { getConfig } from "../../config";
import Log from "../Loggers/Logger";
import {
	BulkCreateOptions,
	CreateOptions,
	DestroyOptions,
	FindOptions,
	InstanceDestroyOptions,
	InstanceUpdateOptions,
	UpdateOptions,
	WhereOptions,
} from "sequelize";
import { AnyTable } from "../../types/DB/General";
import { publish } from "../../utils/topics";
import { getContext } from "../../loaders/routes/context";

const log = new Log("DB");
const db = {
	sequelize: {} as Sequelize,
	Sequelize: {} as unknown,
};

const notify = (action: string, model: string, data: any) => {
	publish("DB_EVENT", {
		action,
		model,
		data,
	});
};

export default db;

const getModelName = (data: any): string => {
	try {
		let optionsName = data?.model?.name;
		let modelName = data?.constructor?.name;
		if (modelName == "Object") modelName = null;

		return optionsName || modelName || "UNKNOWN";
	} catch (e) {
		log.error("Error getting model name", e);
		return "UNKNOWN";
	}
};

export const init = async (options?: { excludedModels?: string[]; includedModels?: string[] }) => {
	const sequelize = new Sequelize(getConfig("DB_TOKEN"), {
		dialect: "postgres",
		ssl: true,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
		timezone: "-03:00",
		logging: false,
		define: {
			// returning: true,
			hooks: {
				//FIND
				beforeFind(options: FindOptions<AnyTable>) {
					if (options.where) {
						options.where = {
							...options.where,
							siteId: getContext("site") || "",
						};
					} else {
						options.where = {
							siteId: getContext("site") || "",
						};
					}
				},
				//CREATE
				beforeBulkCreate: (records: AnyTable[], options: BulkCreateOptions) => {
					records.forEach((record: AnyTable) => (record.siteId = getContext("site") || "siteUS"));

					if (!getConfig("DB_INSERT")) {
						options.logging = true;
						log.db(`[${getModelName(options)}] Inserting records...`, records);
					} else {
						log.db(`[${getModelName(options)}] Inserting records...`);
					}
				},
				beforeCreate: (record: AnyTable, options: CreateOptions<AnyTable>) => {
					record.siteId = getContext("site") || "siteUS";
					if (!getConfig("DB_INSERT")) {
						options.logging = true;
						log.db(`[${getModelName(record)}] Insertang record...`, record);
					} else {
						log.db(`[${getModelName(record)}] Inserting record...`);
					}
				},
				afterBulkCreate: (records: Model[], options: BulkCreateOptions<AnyTable>) => {
					if (!getConfig("DB_INSERT")) {
						log.db(`[${getModelName(options)}] Records deleted!`, records);
					} else {
						log.db(`[${getModelName(options)}] Records deleted`);
					}

					notify("BULK_INSERT", getModelName(options), records);
				},
				afterCreate: (record: Model, _: CreateOptions<AnyTable>) => {
					if (!getConfig("DB_INSERT")) {
						log.db(`[${getModelName(record)}] Record inserted!`, record);
					} else {
						log.db(`[${getModelName(record)}] Record inserted!`);
					}

					notify("INSERT", getModelName(record), record);
				},

				//UPDATE
				beforeBulkUpdate: (options: UpdateOptions<AnyTable[]>) => {
					const where: WhereOptions<AnyTable> = {
						siteId: getContext("site"),
						...options.where,
					};

					options.where = where;
					// options.returning = true;
					if (!getConfig("DB_UPDATE")) {
						options.logging = true;
						log.db(`[${getModelName(options)}] Updating records...`, options);
					} else {
						log.db(`[${getModelName(options)}] Updating records...`);
					}
				},
				beforeUpdate: (record: AnyTable, _: InstanceUpdateOptions) => {
					record.siteId = getContext("site");
					if (!getConfig("DB_UPDATE")) {
						log.db(`[${getModelName(record)}] Updating record...`, record);
					} else {
						log.db(`[${getModelName(record)}] Updating record...`);
					}
				},

				beforeUpsert: (record: AnyTable, instance: any) => {
					record.siteId = getContext("site") || "siteUS";
					if (!getConfig("DB_UPDATE")) {
						log.db(`[${instance.model.name}] Updating record...`, record);
					} else {
						log.db(`[${instance.model.name}] Updating record...`);
					}
				},

				afterBulkUpdate: (options: UpdateOptions<AnyTable>) => {
					const opts: UpdateOptions<AnyTable[]> & { model: { name: string } } = options as UpdateOptions<
						AnyTable[]
					> & { model: { name: string } };
					if (!getConfig("DB_UPDATE")) {
						log.db(`[${getModelName(options)}] Records updated!`);
					} else {
						log.db(`[${getModelName(options)}] Records updated`);
					}

					notify("UPDATE", getModelName(options), opts.where);
				},
				afterUpdate: (record: Model, options: InstanceUpdateOptions) => {
					if (!getConfig("DB_UPDATE")) {
						log.db(`[${getModelName(options)}] Record updated`, record);
					} else {
						log.db(`[${getModelName(options)}] Record updated`);
					}
					notify("UPDATE", getModelName(options), record);
				},

				//DELETE
				beforeBulkDestroy: (options: DestroyOptions<AnyTable[]>) => {
					const where: WhereOptions<AnyTable> = {
						// siteId: getContext("site"),
						...options.where,
					};

					options.where = where;

					if (!getConfig("DB_DELETE")) {
						options.logging = true;
						log.db(`[${getModelName(options)}] Deleting records...`, options);
					} else {
						log.db(`[${getModelName(options)}] Deleting records...`);
					}
				},
				beforeDestroy: (record: AnyTable, options: InstanceDestroyOptions) => {
					// record.siteId = getContext("site");
					if (!getConfig("DB_DELETE")) {
						options.logging = true;
						log.db(`[${getModelName(options)}] Deleting record...`, record);
					} else {
						log.db(`[${getModelName(options)}] Deleting record...`);
					}
				},
				afterBulkDestroy: (options: DestroyOptions) => {
					const opts: UpdateOptions<AnyTable[]> & { model: { name: string } } = options as UpdateOptions<
						AnyTable[]
					> & { model: { name: string } };
					if (!getConfig("DB_DELETE")) {
						log.db(`[${getModelName(options)}] Records deleted!`, options);
					} else {
						log.db(`[${getModelName(options)}] Records deleted!`);
					}

					notify("BULK_DELETE", getModelName(options), opts);
				},
				afterDestroy: (record: Model, options: InstanceDestroyOptions) => {
					if (!getConfig("DB_DELETE")) {
						log.db(`[${getModelName(options)}] Record deleted!`, record);
					} else {
						log.db(`[${getModelName(options)}] Record deleted!`);
					}

					notify("DELETE", getModelName(options), record);
				},
			},
		},
	});

	log.db("Loading models...");

	// Ruta a la carpeta que contiene los archivos de los modelos
	const modelsPath = path.join(__dirname, "models_v2");

	let models: ModelCtor[] = [];
	// Leer los archivos de la carpeta
	fs.readdirSync(modelsPath).forEach((file) => {
		// Verificar que el archivo sea un archivo TypeScript
		if (file.indexOf(".map") == -1) {
			// Importar el modelo y agregarlo a Sequelize
			try {
				let shouldLoad = true;
				if (options) {
					if (options.excludedModels && options.excludedModels.includes(file.split(".")[0])) {
						shouldLoad = false;
					}

					if (options.includedModels && !options.includedModels.includes(file.split(".")[0])) {
						shouldLoad = false;
					}
				}

				if (shouldLoad) {
					const model = require(path.join(modelsPath, file)).default;
					models.push(model);
				}
			} catch (error) {
				log.error(`Error loading model ${file}`, error);
			}
		}
	});

	sequelize.addModels(models);

	log.db("✅ Models loaded");
	db.sequelize = sequelize;
	db.Sequelize = Sequelize;
};

export const authenticate = async () => {
	await db.sequelize.authenticate();
};

export const getInstance = (): Sequelize => db.sequelize;
