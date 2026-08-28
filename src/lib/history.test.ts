import { describe, expect, it } from 'vitest';
import { EditHistory } from './history';

describe('EditHistory', () => {
	it('undoes and redoes a patch', () => {
		const history = new EditHistory();
		history.push({ indices: Uint32Array.of(1, 3), before: Uint16Array.of(0, 0), after: Uint16Array.of(2, 2), label: 'Stroke' });
		const painted = Uint16Array.from([0, 2, 0, 2]);
		const undone = history.undo(painted).cells;
		expect([...undone]).toEqual([0, 0, 0, 0]);
		expect([...history.redo(undone).cells]).toEqual([...painted]);
	});

	it('drops the redo branch when a new edit is pushed after undo', () => {
		const history = new EditHistory(96);
		history.push({ indices: Uint32Array.of(0), before: Uint16Array.of(0), after: Uint16Array.of(1), label: 'A' });
		history.undo(Uint16Array.of(1));
		history.push({ indices: Uint32Array.of(0), before: Uint16Array.of(0), after: Uint16Array.of(2), label: 'B' });
		expect(history.canRedo).toBe(false);
		expect(history.canUndo).toBe(true);
	});
});
