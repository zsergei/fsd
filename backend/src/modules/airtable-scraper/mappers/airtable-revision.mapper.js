/**
 * Maps a raw Airtable activity to an array of flat revision documents,
 * one per tracked field change. Non-tracked fields and change types are discarded.
 * @param {string} connectionId
 * @param {string} recordId
 * @param {Record<string, unknown>} activity
 * @param {string[]} trackedFields - Field names to keep (e.g. ['Assignee', 'Status']).
 * @param {string[]} trackedChangeTypes - Change types to keep (e.g. ['diff', 'updated', 'cleared']).
 * @returns {Array<Record<string, unknown>>}
 */
export function mapActivityToDocs(connectionId, recordId, activity, trackedFields, trackedChangeTypes) {
	const changes = parseDiffHtml(activity.diffRowHtml);
	const tracked = changes.filter(change =>
		trackedFields.includes(change.fieldName) && trackedChangeTypes.includes(change.changeType)
	);
	const createdDate = activity.createdTime ? new Date(activity.createdTime) : undefined;
	const authoredBy = activity.originatingUserId ?? null;

	return tracked.map(change => {
		const { oldValue, newValue } = resolveValues(change.changeType, change.values, change.diffPair);

		return {
			connectionId,
			uuid: activity.id,
			issueId: recordId,
			columnType: change.fieldName,
			oldValue,
			newValue,
			createdDate,
			authoredBy
		};
	});
}

/**
 * Derives oldValue / newValue from the changeType and parsed values.
 * @param {string} changeType - 'created' | 'cleared' | 'updated' | 'diff' | 'unknown'
 * @param {Array<unknown>} values - Flat values list (for created/cleared/updated).
 * @param {{ oldValue: unknown, newValue: unknown }} [diffPair] - Explicit pair for 'diff' blocks.
 * @returns {{ oldValue: string | null, newValue: string | null }}
 */
function resolveValues(changeType, values, diffPair) {
	switch (changeType) {
		case 'created':
			return { oldValue: null, newValue: extractValue(values[0]) };
		case 'cleared':
			return { oldValue: extractValue(values[0]), newValue: null };
		case 'updated':
			return { oldValue: extractValue(values[0]), newValue: extractValue(values[1]) };
		case 'diff':
			return { oldValue: extractValue(diffPair?.oldValue), newValue: extractValue(diffPair?.newValue) };
		default:
			return { oldValue: null, newValue: extractValue(values[0]) };
	}
}

/**
 * Extracts a scalar string from a value. Objects with an `id` property
 * (e.g. collaborator references) are reduced to that id.
 * @param {unknown} val
 * @returns {string | null}
 */
function extractValue(val) {
	if (val == null) return null;
	if (typeof val === 'object' && val.id) return String(val.id);
	return String(val);
}

/**
 * Extracts field changes from the Airtable revision HTML diff.
 * Each `historicalCellContainer` block contains a columnId attribute and the changed values.
 *
 * Supports two HTML patterns:
 * - Explicit classes: `nullToValue`, `valueToNull`, `valueToValue` — values extracted in DOM order.
 * - Diff blocks: `historicalCellValue diff` — values classified by CSS markers
 *   (`colors-background-success` = new, `strikethrough`/`line-through` = old).
 *
 * @param {string} [html]
 * @returns {Array<{ fieldId: string, fieldName: string, changeType: string, values: string[], diffPair?: { oldValue: string|null, newValue: string|null } }>}
 */
function parseDiffHtml(html) {
	if (!html) return [];

	const changes = [];
	const blockRegex = /<div class="historicalCellContainer">([\s\S]*?)(?=<div class="historicalCellContainer">|$)/g;
	let blockMatch;

	while ((blockMatch = blockRegex.exec(html)) !== null) {
		const block = blockMatch[1];

		const fieldIdMatch = block.match(/columnId="([^"]+)"/i);
		const fieldNameMatch = block.match(/columnId="[^"]*"[^>]*>([^<]+)</i);
		const fieldId = fieldIdMatch?.[1] ?? '';
		const fieldName = fieldNameMatch?.[1]?.trim() ?? '';

		let changeType = 'unknown';
		if (block.includes('nullToValue')) changeType = 'created';
		else if (block.includes('valueToNull')) changeType = 'cleared';
		else if (block.includes('valueToValue')) changeType = 'updated';
		else if (block.includes('historicalCellValue diff')) changeType = 'diff';

		if (changeType === 'diff') {
			const diffPair = extractDiffPair(block, fieldName);
			if (fieldId) {
				changes.push({ fieldId, fieldName, changeType, values: [], diffPair });
			}
			continue;
		}

		const valueRegex = /title="([^"]+)"|class="[^"]*truncate[^"]*"[^>]*>([^<]+)/g;
		const values = [];
		let valMatch;
		while ((valMatch = valueRegex.exec(block)) !== null) {
			const val = (valMatch[1] ?? valMatch[2])?.trim();
			if (val && val !== fieldName) values.push(val);
		}

		if (fieldId) {
			changes.push({ fieldId, fieldName, changeType, values });
		}
	}

	return changes;
}

/**
 * Extracts old/new values from a `historicalCellValue diff` block by finding the
 * nearest preceding CSS marker for each text value. `colors-background-success`
 * marks the new value; `strikethrough` or `line-through` marks the old value.
 * @param {string} block - Inner HTML of a single `historicalCellContainer`.
 * @param {string} fieldName - Field label to exclude from captured text.
 * @returns {{ oldValue: string|null, newValue: string|null }}
 */
function extractDiffPair(block, fieldName) {
	const valueRegex = /title="([^"]+)"|class="[^"]*(?:truncate-pre|truncate)[^"]*"[^>]*>([^<]+)/g;
	const entries = [];
	let m;
	while ((m = valueRegex.exec(block)) !== null) {
		const val = (m[1] ?? m[2])?.trim();
		if (val && val !== fieldName) {
			entries.push({ pos: m.index, val });
		}
	}

	const newMarkerPositions = findAllPositions(block, /colors-background-success|greenLight/g);
	const oldMarkerPositions = findAllPositions(block, /strikethrough|line-through|colors-background-negative/g);

	let newValue = null;
	let oldValue = null;

	for (const entry of entries) {
		const nearestNew = lastBefore(newMarkerPositions, entry.pos);
		const nearestOld = lastBefore(oldMarkerPositions, entry.pos);

		if (nearestOld > nearestNew) {
			if (!oldValue) oldValue = entry.val;
		} else if (nearestNew > nearestOld) {
			if (!newValue) newValue = entry.val;
		}
	}

	return { oldValue, newValue };
}

/** Returns all match start positions for a global regex. */
function findAllPositions(str, regex) {
	const positions = [];
	let m;
	while ((m = regex.exec(str)) !== null) positions.push(m.index);
	return positions;
}

/** Returns the largest value in `arr` that is less than `threshold`, or -1 if none. */
function lastBefore(arr, threshold) {
	let best = -1;
	for (const pos of arr) {
		if (pos < threshold && pos > best) best = pos;
	}
	return best;
}
