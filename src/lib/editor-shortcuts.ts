export type EditorShortcut =
	| 'pencil' | 'fill' | 'eraser' | 'picker' | 'select' | 'temporary-pan'
	| 'undo' | 'redo' | 'save' | 'export' | 'grid' | 'zoom-in' | 'zoom-out' | 'fit' | 'escape' | 'help'
	| { type: 'palette'; slot: number };

type ShortcutEvent = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>;

export function resolveEditorShortcut(event: ShortcutEvent): EditorShortcut | null {
	const command = event.ctrlKey || event.metaKey;
	const key = event.key.toLowerCase();
	if (command) {
		if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
		if (key === 'y') return 'redo';
		if (key === 's') return 'save';
		if (key === 'e') return 'export';
		return null;
	}
	if (event.altKey) return null;
	if (event.code === 'Space' || event.key === ' ') return 'temporary-pan';
	if (/^[1-9]$/.test(event.key)) return { type: 'palette', slot: Number(event.key) - 1 };
	if (event.key === '?' || (event.code === 'Slash' && event.shiftKey)) return 'help';
	if (event.key === 'Escape') return 'escape';
	if (event.key === '+' || event.key === '=') return 'zoom-in';
	if (event.key === '-' || event.key === '_') return 'zoom-out';
	if (event.key === '0') return 'fit';
	if (key === 'p') return 'pencil';
	if (key === 'f') return 'fill';
	if (key === 'e') return 'eraser';
	if (key === 'i') return 'picker';
	if (key === 's') return 'select';
	if (key === 'g') return 'grid';
	return null;
}
