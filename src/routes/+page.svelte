<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ProjectHomeView from '$lib/components/ProjectHomeView.svelte';
	import { createCloudProject, deleteCloudProject, listCloudProjects, registerDevice } from '$lib/cloud/api';
	import { getDeviceIdentity, updateDeviceDisplayName } from '$lib/cloud/device';
	import type { CloudProjectSummary, DeviceIdentity } from '$lib/cloud/types';
	import { createProject, deserializeProject } from '$lib/project';

	let projects = $state<CloudProjectSummary[]>([]);
	let device = $state<DeviceIdentity | null>(null);
	let ready = $state(false);
	let error = $state<string | null>(null);

	onMount(() => { void initialize(); });

	async function initialize() {
		try {
			device = getDeviceIdentity();
			await registerDevice(device);
			projects = (await listCloudProjects(device)).projects;
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Proyek belum dapat dimuat.';
		} finally {
			ready = true;
		}
	}

	async function createNew(input: { name: string; widthMm: number; heightMm: number; cellMm: number; mode: 'blank' }) {
		if (!device) throw new Error('Perangkat belum siap.');
		try {
			const project = createProject(input);
			await createCloudProject(device, project);
			await goto(`/project/${project.id}`);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Proyek gagal dibuat.';
		}
	}

	async function removeProject(id: string) {
		if (!device) return;
		try {
			await deleteCloudProject(device, id);
			projects = (await listCloudProjects(device)).projects;
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Proyek gagal dihapus.';
		}
	}

	async function importProject(file: File) {
		if (!device) return;
		try {
			if (file.size > 50 * 1024 * 1024) throw new Error('File proyek melebihi batas 50 MB.');
			const imported = deserializeProject(await file.text());
			const now = new Date().toISOString();
			const project = { ...imported, id: crypto.randomUUID(), name: `${imported.name} (impor)`, createdAt: now, updatedAt: now };
			await createCloudProject(device, project);
			await goto(`/project/${project.id}`);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'File proyek tidak dapat dibuka.';
		}
	}

	async function renameDevice() {
		if (!device) return;
		const name = prompt('Nama yang ditampilkan ketika bekerja bersama:', device.displayName);
		if (!name?.trim()) return;
		device = updateDeviceDisplayName(device, name);
		await registerDevice(device);
	}
</script>

{#if device}
	<ProjectHomeView
		{projects}
		{ready}
		deviceName={device.displayName}
		deviceId={device.id}
		onCreate={createNew}
		onOpen={(project) => goto(`/project/${project.id}`)}
		onDelete={removeProject}
		onImport={importProject}
		onRenameDevice={renameDevice}
	/>
{:else if !ready}
	<div class="loading">Menyiapkan proyek…</div>
{/if}

{#if error}<div class="root-error" role="alert"><span>{error}</span><button onclick={() => (error = null)}>×</button></div>{/if}

<style>
	.loading{min-height:100vh;display:grid;place-items:center;color:#66716b}.root-error{position:fixed;z-index:100;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;max-width:min(560px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.22)}.root-error button{border:0;background:transparent;color:white;font-size:18px}
</style>