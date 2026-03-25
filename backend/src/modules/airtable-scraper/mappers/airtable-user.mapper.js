/**
 * Maps a collaborator object from the Airtable internal API to a Mongoose document shape.
 * @param {string} connectionId
 * @param {Record<string, unknown>} collaborator - Raw collaborator from readCollaboratorsForUnifiedShareDialog.
 * @param {'collaborator' | 'workspaceCollaborator'} source
 */
export function mapCollaboratorToDoc(connectionId, collaborator, source) {
	return {
		connectionId,
		airtableUserId: collaborator.id,
		firstName: collaborator.firstName ?? null,
		lastName: collaborator.lastName ?? null,
		email: collaborator.email ?? null,
		profilePicUrl: collaborator.profilePicUrl ?? null,
		permissionLevel: collaborator.permissionLevel ?? null,
		isDeactivated: collaborator.isDeactivated ?? false,
		grantedByUserId: collaborator.grantedByUserId ?? null,
		createdTime: collaborator.createdTime ? new Date(collaborator.createdTime) : undefined,
		source
	};
}
