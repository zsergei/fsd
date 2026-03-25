import { Camoufox } from 'camoufox-js';
import { execFileSync } from 'node:child_process';

const PX_HOLD_DURATION_MS = 12_000;
const PX_MAX_ATTEMPTS = 3;
const PX_POST_SOLVE_DELAY_MS = 5_000;

/** `'virtual'` when Xvfb is installed (Docker), `true` otherwise. */
const HEADLESS_MODE = (() => {
	try {
		execFileSync('which', ['Xvfb'], { stdio: 'ignore' });
		return 'virtual';
	} catch {
		return true;
	}
})();

/**
 * Launches a Camoufox browser with anti-detection defaults.
 * Uses Xvfb virtual display when available, falls back to headless.
 * @returns {Promise<import('playwright').Browser>}
 */
export function launchCamoufox() {
	return Camoufox({ headless: HEADLESS_MODE, humanize: true });
}

/**
 * Detects a PerimeterX / HUMAN "press and hold" challenge and solves it
 * by simulating a mouse hold on the #px-captcha element. Retries up to
 * {@link PX_MAX_ATTEMPTS} times before throwing.
 * @param {import('playwright').Page} page
 * @param {string} [logTag='scraper'] - Prefix for log lines.
 * @param {(step: string) => void} [onProgress] - Optional callback for real-time progress updates.
 */
export async function solvePerimeterXIfPresent(page, logTag = 'scraper', onProgress) {
	for (let attempt = 1; attempt <= PX_MAX_ATTEMPTS; attempt++) {
		const title = await page.title().catch(() => '');
		if (!title.includes('Verify')) return;

		const captchaDiv = page.locator('#px-captcha');
		const visible = await captchaDiv.isVisible({ timeout: 3_000 }).catch(() => false);
		if (!visible) return;

		const box = await captchaDiv.boundingBox();
		if (!box) return;

		console.log(`[${logTag}] PerimeterX challenge detected (attempt ${attempt}/${PX_MAX_ATTEMPTS}), solving...`);
		onProgress?.(`Solving security challenge (attempt ${attempt}/${PX_MAX_ATTEMPTS})...`);
		const x = box.x + box.width / 2;
		const y = box.y + box.height / 2;
		await page.mouse.move(x, y, { steps: 10 });
		await page.waitForTimeout(500);
		await page.mouse.down();
		await page.waitForTimeout(PX_HOLD_DURATION_MS);
		await page.mouse.up();
		await page.waitForTimeout(PX_POST_SOLVE_DELAY_MS);

		const titleAfter = await page.title().catch(() => '');
		if (!titleAfter.includes('Verify')) {
			console.log(`[${logTag}] PerimeterX challenge solved`);
			return;
		}
	}

	throw new Error('CAPTCHA');
}
