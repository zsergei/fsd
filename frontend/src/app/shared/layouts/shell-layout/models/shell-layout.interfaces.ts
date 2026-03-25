export interface SidenavLink {
	readonly icon: string;
	readonly id: string;
	readonly label: string;
	readonly link: string;
	readonly disabled?: boolean;
	readonly external?: boolean;
}

export interface Breadcrumb {
	label: string;
	route?: string;
}

export interface RouteData {
	navId: string;
	breadcrumbs: Breadcrumb[];
}
