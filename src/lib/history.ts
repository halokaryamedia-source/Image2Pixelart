import type { CellPatch } from '$lib/types';

const DEFAULT_LIMIT = 50 * 1024 * 1024;

export class EditHistory {
	private undoStack: CellPatch[] = [];
	private redoStack: CellPatch[] = [];
	private bytes = 0;

	constructor(private readonly byteLimit = DEFAULT_LIMIT) {}

	get canUndo(): boolean { return this.undoStack.length > 0; }
	get canRedo(): boolean { return this.redoStack.length > 0; }

	push(patch: CellPatch): void {
		if (patch.indices.length === 0) return;
		for (const redo of this.redoStack) this.bytes -= redo.indices.byteLength + redo.before.byteLength + redo.after.byteLength;
		this.undoStack.push(patch);
		this.redoStack = [];
		this.bytes += patch.indices.byteLength + patch.before.byteLength + patch.after.byteLength;
		while (this.bytes > this.byteLimit && this.undoStack.length > 1) {
			const removed = this.undoStack.shift()!;
			this.bytes -= removed.indices.byteLength + removed.before.byteLength + removed.after.byteLength;
		}
	}

	undo(cells: Uint16Array): { cells: Uint16Array; label?: string } {
		const patch = this.undoStack.pop();
		if (!patch) return { cells };
		const next = cells.slice();
		patch.indices.forEach((index, offset) => { next[index] = patch.before[offset]; });
		this.redoStack.push(patch);
		return { cells: next, label: patch.label };
	}

	redo(cells: Uint16Array): { cells: Uint16Array; label?: string } {
		const patch = this.redoStack.pop();
		if (!patch) return { cells };
		const next = cells.slice();
		patch.indices.forEach((index, offset) => { next[index] = patch.after[offset]; });
		this.undoStack.push(patch);
		return { cells: next, label: patch.label };
	}

	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
		this.bytes = 0;
	}
}
