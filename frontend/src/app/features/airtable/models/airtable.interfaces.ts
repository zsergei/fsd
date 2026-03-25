export interface AirtableBase {
	airtableBaseId: string;
	name: string;
	permissionLevel: string | null;
}

export interface AirtableBasesResponse {
	bases: AirtableBase[];
}

export interface AirtableField {
	airtableFieldId: string;
	name: string;
	type: string;
	description: string;
}

export interface AirtableView {
	airtableViewId: string;
	name: string;
	type: string;
}

export interface AirtableTable {
	airtableBaseId: string;
	airtableTableId: string;
	name: string;
	description: string;
	primaryFieldId: string | null;
	fields: AirtableField[];
	views: AirtableView[];
}

export interface AirtableTablesResponse {
	tables: AirtableTable[];
}

export interface AirtableRecord {
	airtableBaseId: string;
	airtableTableId: string;
	airtableRecordId: string;
	airtableCreatedTime: string | null;
	[field: string]: unknown;
}

export interface AirtableRecordsSyncResponse {
	count: number;
}

export interface AirtableRecordsResponse {
	records: AirtableRecord[];
}

export interface ScraperLoginRequest {
	email: string;
	password: string;
}

export interface ScraperLoginResponse {
	status: 'success' | 'mfa_required';
	sessionId: string;
}

export interface LoginProgressEvent {
	step: string;
}

export interface LoginResultEvent {
	type: 'result';
	status: 'success' | 'mfa_required';
	sessionId: string;
}

export interface LoginErrorEvent {
	type: 'error';
	message: string;
}

export type LoginSseEvent = LoginProgressEvent | LoginResultEvent | LoginErrorEvent;

export interface ScraperMfaRequest {
	sessionId: string;
	code: string;
}

export interface ScraperMfaResponse {
	status: 'success';
}

export interface ScraperCookieStatusResponse {
	valid: boolean;
	expiresAt: string | null;
}

export interface AirtableRevision {
	uuid: string;
	issueId: string;
	columnType: string;
	oldValue: string | null;
	newValue: string | null;
	createdDate: string;
	authoredBy: string | null;
}

export interface AirtableRevisionsSyncResponse {
	status: string;
	revisionsStored: number;
}

export interface AirtableUser {
	airtableUserId: string;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	profilePicUrl: string | null;
	permissionLevel: string | null;
	isDeactivated: boolean;
	grantedByUserId: string | null;
	createdTime: string | null;
	source: 'collaborator' | 'workspaceCollaborator';
}

export interface AirtableUsersSyncResponse {
	status: string;
	usersStored: number;
}
