import { KeyValueObj } from "./General";

interface IDBInsertSuccess<T> {
	success: true;
	recordId: number;
	record?: T;
	created?: boolean;
}

interface IDBInsertError {
	success: false;
	error: string;
}
export type DBInsert<T = any> = IDBInsertSuccess<T> | IDBInsertError;
export interface DBDependency {
	entityData: KeyValueObj;
	entityName: string;
	recordId: number;
}
export interface DBDependenciesResult {
	success: boolean;
	records: DBDependency[];

	error?: string;
}
