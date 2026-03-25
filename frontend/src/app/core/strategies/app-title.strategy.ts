import { Title } from '@angular/platform-browser';
import { Injectable, inject } from '@angular/core';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';

import { environment } from '../../../environments/environment';
import { getShellPageLabelFromRouterRoot } from '../../shared/layouts/shell-layout/utils/shell.utils';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
	private readonly title = inject(Title);

	/**
	 * Updates the title of the page based on the current route.
	 */
	public override updateTitle(snapshot: RouterStateSnapshot): void {
		const appName = environment.appSettings.title;
		const pageLabel = getShellPageLabelFromRouterRoot(snapshot.root) ?? super.buildTitle(snapshot);
		this.title.setTitle(pageLabel ? `${pageLabel} - ${appName}` : appName);
	}
}
