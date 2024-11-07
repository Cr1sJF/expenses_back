import cors from "cors";
import { Application } from "express";

const EXCLUDED_APIS = [
	"/payment",
	"/pageViews",
	"/allPageViews",
	"/setPageViewsToProduct",
	"/allProducts",
	"/import",
	"/export",
	"/feed-facebook",
	"/robots",
	"/payment_reservar",
	"/reservar",
	"/shippingCalculator",
	"/solverAllProducts",
	"/quotePV",
	"/new_appointment",
	"/recibir_encuesta",
	"/survey_new_car",
	"/externalPrice",
	"/clearCache",
	"/api/v1/docs",
	"/slack/notify",
	"/generic",
	"/commit",
];

const ALLOWED_ORIGINS = [
	"https://p7124102c1tst-admin.occa.ocs.oraclecloud.com",
	"https://p7124102c1tst-store.occa.ocs.oraclecloud.com",
	"https://p7124102c1prd-admin.occa.ocs.oraclecloud.com",
	"https://p7124102c1prd-store.occa.ocs.oraclecloud.com",
	"https://www.brunofritsch.cl",
	"https://www.bf.cl",
	// "http://localhost",
	"https://p7124102c1dev-admin.occa.ocs.oraclecloud.com",
	"https://p7124102c1dev-store.occa.ocs.oraclecloud.com",
];
export default async (app: Application) => {
	app.options("*", cors());

	app.use((req, res, next) => {
		const path = req.path.toUpperCase();
		const origin = req.get("origin") || req.hostname;

		let excluded_api;

		if (path === "/") excluded_api = true;
		else {
			excluded_api = EXCLUDED_APIS.some((api) => path.indexOf(api.toUpperCase()) != -1);
		}

		const excluded_origin = ALLOWED_ORIGINS.includes(origin.toLowerCase());
		const isExternalSource = req.headers["x-external-source"];

		if (excluded_api || excluded_origin || isExternalSource) {
			next();
		} else {
			res.status(200).send("NOT ALLOWED");
		}
	});

	app.use(cors());
};
