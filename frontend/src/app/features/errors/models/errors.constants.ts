import { ErrorCatalogEntry } from './errors.interfaces';

export const DEFAULT_ENTRY: ErrorCatalogEntry = {
	headline: 'Error',
	description: 'Something went wrong.'
};

export const ERROR_CATALOG: Readonly<Record<string, ErrorCatalogEntry>> = {
	'403': {
		headline: 'Access denied',
		description: 'You do not have permission to view this resource.'
	},
	'404': {
		headline: 'Page not found',
		description: 'The page you are looking for does not exist or was moved.'
	},
	'401': {
		headline: 'Authorization failed',
		description: 'We could not complete the sign-in process.'
	},
	'500': {
		headline: 'Something went wrong',
		description: 'An unexpected error occurred. Please try again later.'
	}
};
