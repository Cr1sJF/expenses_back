import { Application } from "express";
import fs from "fs";
import path from "path";

const basename = path.basename(__filename);

const getAllFilesInFolder = (folderPath: string): string[] => {
	const files: string[] = [];

	function readFolder(currentPath: string) {
		const contents = fs.readdirSync(currentPath);
		contents.forEach((item) => {
			const itemPath = path.join(currentPath, item);
			const stat = fs.statSync(itemPath);

			if (stat.isFile()) {
				files.push(itemPath);
			} else if (stat.isDirectory()) {
				readFolder(itemPath);
			}
		});
	}

	readFolder(folderPath);
	return files;
};

export default async (app: Application) => {
	const fileList = getAllFilesInFolder(__dirname);
	fileList
		.filter((file: string) => {
			return path.basename(file) !== basename && file.indexOf(".map") == -1 && file.indexOf(".yaml") == -1;
		})
		.forEach((file: string) => {
			const controller = require(file).default;
			app.use(`/v${controller.version || "1"}${controller.basePath}`, controller.router);
		});
};
