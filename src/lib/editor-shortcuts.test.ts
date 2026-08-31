import { describe, expect, it } from 'vitest';
import { resolveEditorShortcut } from './editor-shortcuts';

const key = (value: string, input: Partial<KeyboardEvent> = {}) => resolveEditorShortcut({
	key: value, code: input.code ?? '', ctrlKey: input.ctrlKey ?? false, metaKey: input.metaKey ?? false,
	shiftKey: input.shiftKey ?? false, altKey: input.altKey ?? false
});

describe('editor shortcuts', () => {
	it('maps drawing tools and palette slots', () => {
		expect(key('p')).toBe('pencil');
		expect(key('F')).toBe('fill');
		expect(key('4')).toEqual({ type: 'palette', slot: 3 });
	});

	it('supports macOS and Windows history shortcuts', () => {
		expect(key('z', { metaKey: true })).toBe('undo');
		expect(key('z', { ctrlKey: true, shiftKey: true })).toBe('redo');
		expect(key('y', { ctrlKey: true })).toBe('redo');
	});

	it('reserves space for temporary panning and question mark for help', () => {
		expect(key(' ', { code: 'Space' })).toBe('temporary-pan');
		expect(key('?', { code: 'Slash', shiftKey: true })).toBe('help');
	});
});
