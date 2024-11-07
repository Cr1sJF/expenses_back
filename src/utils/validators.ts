import Joi, { CustomHelpers } from "joi";

export const REGEX_DDMMYYYY = /^[0-3][0-9]\/[0-1][0-9]\/(19[0-9][0-9]|20[0-9][0-9])/;
export const REGEX_HHMM = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const REGEX_OFFICE_ID = /^\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}$/;

const plateValidatorFactory = (format: string, regex: RegExp) => {
	return (value: string, helpers: CustomHelpers) => {
		if (!value) return helpers.message({ custom: "Missing param 'plate'" });

		if (regex.test(value)) {
			// Si el valor es válido, no se produce ningún error y se devuelve el valor tal cual
			return value;
		} else {
			// Si el valor no es válido, se genera un error utilizando "helpers.error()"
			return helpers.message({ custom: `Invalid plate format. Expected: ${format}` });
		}
	};
};

export const docNumberValidatorFactory = (format: string, regex: RegExp) => {
	return Joi.string()
		.required()
		.regex(regex)
		.messages({ "string.pattern.base": `"docNumber" must be in format ${format}` });
};

export const documentValidator = (format: string, regex: string | RegExp) =>
	docNumberValidatorFactory(format, typeof regex == "string" ? new RegExp(regex) : regex);

export const plateValidator = (format: string, regex: string | RegExp) =>
	Joi.string()
		.required()
		.custom(plateValidatorFactory(format, typeof regex == "string" ? new RegExp(regex) : regex));

export const dateValidator = Joi.string().required().regex(REGEX_DDMMYYYY, {
	name: "DD/MM/YYYY",
});

export const hourValidator = Joi.string().required().regex(REGEX_HHMM, {
	name: "HH:mm",
});

export const branchIdValidator = Joi.string().required().regex(REGEX_OFFICE_ID, {
	name: "##-##-##-##",
});

export const phoneValidator = (length: number) => {
	return Joi.string()
		.required()
		.length(length)
		.messages({ "string.pattern.base": `"docNumber" must be in format ${"X".repeat(length)}` });
};

export const getClientDBValidator = (docFormat: string, docRegex: string | RegExp) => {
	return Joi.object({
		docNumber: documentValidator(docFormat, docRegex),
		name: Joi.string().required(),
		lastName: Joi.string().required(),
		email: Joi.string().required(),
		phone: Joi.string().required(),
		siteId: Joi.string().optional(),
	}).required();
};

export const getVehicleDBValidator = (plateFormat: string, plateRegex: string | RegExp, extend?: string[]) => {
	let schema = Joi.object({
		plate: plateValidator(plateFormat, plateRegex).optional(),
		year: Joi.number().required(),
		brand: Joi.string().required(),
		model: Joi.string().required(),
		version: Joi.string().optional(),
		source: Joi.string().optional().allow(null),
		siteId: Joi.string().optional(),
	});

	if (extend) {
		extend.forEach((field) => {
			schema = schema.concat(Joi.object({ [field]: Joi.required() }));
		});
	}

	return schema;
};

export const getClientValidator = (docFormat: string, docRegex: string | RegExp) => {
	return Joi.object({
		docNumber: documentValidator(docFormat, docRegex),
		name: Joi.string().required(),
		lastName: Joi.string().required(),
		email: Joi.string().required(),
		phone: Joi.string().required(),
	}).required();
};

export const getVehicleValidator = (
	plateFormat: string,
	plateRegex: string | RegExp,
	validateVerison: boolean = false
) => {
	let schema = Joi.object({
		plate: plateValidator(plateFormat, plateRegex).optional(),
		brand: Joi.string().required(),
		model: Joi.string().required(),
		year: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
	}).required();

	if (validateVerison) {
		schema = schema.concat(
			Joi.object({
				version: Joi.string().required(),
			})
		);
	}

	return schema;
};

export const maintenanceAdditionalServiceValidator = Joi.object({
	code: Joi.string().required(),
	cost: Joi.number().required(),
	name: Joi.string().required(),
});
