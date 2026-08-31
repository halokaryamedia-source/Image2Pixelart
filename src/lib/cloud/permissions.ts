export type ProjectAccessState = { ownerDeviceId: string; activeEditorDeviceId: string | null };
export function isProjectOwner(state: ProjectAccessState, deviceId: string): boolean { return state.ownerDeviceId === deviceId; }
export function isActiveEditor(state: ProjectAccessState, deviceId: string): boolean { return state.activeEditorDeviceId === deviceId; }
export function canGrantEditor(state: ProjectAccessState, deviceId: string): boolean { return isProjectOwner(state, deviceId) || isActiveEditor(state, deviceId); }
