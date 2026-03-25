const MAX_INPUT_LENGTH = 4096;
const ALLOWED_SCHEMES = Object.freeze(['http:', 'https:']);

/**
 * Parses `input` as an absolute URL and returns a safe browser origin string for CORS / redirects.
 * Rejects non-http(s) schemes, userinfo, failed parse, and oversized input.
 *
 * @param {string | undefined} input
 * @returns {string | null} `scheme://host[:port]` (no path, query, fragment, trailing slash)
 */
export function sanitizeUrl(input) {
	if (input == null) return null;

	const trimmed = String(input).trim();
	if (!trimmed || trimmed.length > MAX_INPUT_LENGTH) return null;

	let url;
	try {
		url = new URL(trimmed);
	} catch {
		return null;
	}

	if (!ALLOWED_SCHEMES.includes(url.protocol)) {
		return null;
	}

	if (url.username !== '' || url.password !== '') {
		return null;
	}

	if (!url.hostname) {
		return null;
	}

	return url.origin;
}
