import Branches from "../../models/DB/models_v2/Branches";
import Clients from "../../models/DB/models_v2/Clients";
import FinancingSimulations from "../../models/DB/models_v2/FinancingSimulations";
import Maintenances from "../../models/DB/models_v2/Maintenances";
import Quotes from "../../models/DB/models_v2/Quotes";
import Appraisals from "../../models/DB/models_v2/Appraisals";
import Reserves from "../../models/DB/models_v2/Reserves";
import Sites from "../../models/DB/models_v2/Sites";
import Vehicles from "../../models/DB/models_v2/Vehicles";

export interface IBaseDB {
	siteId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export type AnyTable =
	| Branches
	| Clients
	| FinancingSimulations
	| Maintenances
	| Quotes
	| Appraisals
	| Reserves
	// | Sites
	| Vehicles;
