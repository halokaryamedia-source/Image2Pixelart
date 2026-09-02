export type EditorPanelPreferences = { left: boolean; right: boolean; quick: boolean };

export const EDITOR_PANEL_PREFERENCES_KEY = 'mivubi.editor.panels.v2';
export const DEFAULT_EDITOR_PANEL_PREFERENCES: EditorPanelPreferences = { left: false, right: false, quick: true };

export function parseEditorPanelPreferences(value: string | null): EditorPanelPreferences {
	if (!value) return { ...DEFAULT_EDITOR_PANEL_PREFERENCES };
	try {
		const parsed = JSON.parse(value) as Partial<EditorPanelPreferences>;
		return {
			left: typeof parsed.left === 'boolean' ? parsed.left : false,
			right: typeof parsed.right === 'boolean' ? parsed.right : false,
			quick: typeof parsed.quick === 'boolean' ? parsed.quick : true
		};
	} catch { return { ...DEFAULT_EDITOR_PANEL_PREFERENCES }; }
}