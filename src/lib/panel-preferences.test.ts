import { describe, expect, it } from 'vitest';
import { parseEditorPanelPreferences } from './panel-preferences';

describe('editor panel preferences', () => {
	it('uses safe defaults for missing or malformed values', () => {
		expect(parseEditorPanelPreferences(null)).toEqual({ left: true, right: true, quick: true });
		expect(parseEditorPanelPreferences('{oops')).toEqual({ left: true, right: true, quick: true });
	});

	it('preserves valid flags and defaults missing fields', () => {
		expect(parseEditorPanelPreferences('{"left":false,"quick":false}')).toEqual({ left: false, right: true, quick: false });
	});
});
