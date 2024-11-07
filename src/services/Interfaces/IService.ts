import { IValidationStatus } from "../../types/General";

export interface IService {
	validate(): IValidationStatus;
}
