import { ResolveFn } from '@angular/router';

import { ErrorCatalogEntry } from '../models/errors.interfaces';
import { DEFAULT_ENTRY, ERROR_CATALOG } from '../models/errors.constants';

/**
 * Get the error catalog entry for a given code.
 */
export function getErrorCatalogEntry(code: string): ErrorCatalogEntry {
	return ERROR_CATALOG[code] ?? DEFAULT_ENTRY;
}

/**
 * Resolve the title for the error page.
 */
export const errorPageTitleResolver: ResolveFn<string> = route => {
	const code = route.paramMap.get('code') ?? 'unknown';

	return getErrorCatalogEntry(code).headline;
};
