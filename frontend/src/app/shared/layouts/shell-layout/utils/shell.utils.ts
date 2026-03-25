import type { ActivatedRouteSnapshot, Data } from '@angular/router';

import type { RouteData } from '../models/shell-layout.interfaces';

/**
 * Get the deepest child snapshot from the route.
 */
export function getDeepestChildSnapshot(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
	let current = route;
	while (current.firstChild) {
		current = current.firstChild;
	}

	return current;
}

/**
 * Parse `data.shell` into {@link RouteData} when present and well-formed.
 */
export function parseShellRouteData(data: Data): RouteData | undefined {
	const shell = data['shell'];

	return shell && typeof shell === 'object' ? (shell as RouteData) : undefined;
}

/**
 * Read the shell route data from the root route.
 */
export function readShellRouteData(root: ActivatedRouteSnapshot): RouteData | undefined {
	return parseShellRouteData(getDeepestChildSnapshot(root).data);
}

/**
 * Human-readable shell page label: last breadcrumb segment.
 */
export function getShellPageLabelFromRouteData(data: Data): string | undefined {
	return parseShellRouteData(data)?.breadcrumbs?.at(-1)?.label;
}

/**
 * Shell page label for the deepest primary child under `root` (same leaf as breadcrumbs).
 */
export function getShellPageLabelFromRouterRoot(root: ActivatedRouteSnapshot): string | undefined {
	return getShellPageLabelFromRouteData(getDeepestChildSnapshot(root).data);
}

/**
 * Create shell data for a route.
 */
export function getShellRouteData(navId: string, label: string): { shell: RouteData } {
	return {
		shell: {
			navId,
			breadcrumbs: [{ label }]
		}
	};
}
