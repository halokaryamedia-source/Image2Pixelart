import { describe, expect, it } from 'vitest';
import { canGrantEditor, isActiveEditor, isProjectOwner } from './permissions';

describe('anonymous project permissions', () => {
	const state = { ownerDeviceId: 'owner', activeEditorDeviceId: 'editor' };
	it('allows only the owner to perform owner recovery actions', () => {
		expect(isProjectOwner(state, 'owner')).toBe(true); expect(isProjectOwner(state, 'editor')).toBe(false);
	});
	it('recognizes exactly one active editor device', () => {
		expect(isActiveEditor(state, 'editor')).toBe(true); expect(isActiveEditor(state, 'viewer')).toBe(false);
	});
	it('allows owner or active editor to hand off control', () => {
		expect(canGrantEditor(state, 'owner')).toBe(true); expect(canGrantEditor(state, 'editor')).toBe(true); expect(canGrantEditor(state, 'viewer')).toBe(false);
	});
});
