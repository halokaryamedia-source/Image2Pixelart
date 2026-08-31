<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AdminProjectView from '$lib/components/AdminProjectView.svelte';
	import { createCloudProject, registerDevice } from '$lib/cloud/api';
	import { getDeviceIdentity, updateDeviceDisplayName } from '$lib/cloud/device';
	import type { DeviceIdentity } from '$lib/cloud/types';
	import { createProject } from '$lib/project';

	let device = $state<DeviceIdentity | null>(null);
	let ready = $state(false);
	let error = $state<string | null>(null);

	onMount(() => { void initialize(); });

	async function initialize() {
		try {
			device = getDeviceIdentity();
			await registerDevice(device);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Halaman Admin belum dapat disiapkan.';
		} finally {
			ready = true;
		}
	}

	async function createNew(input: { name: string; widthMm: number; heightMm: number; cellMm: number; mode: 'blank' }) {
		if (!device) throw new Error('Pengguna belum siap.');
		try {
			const project = createProject(input);
			await createCloudProject(device, project);
			await goto(`/project/${project.id}`);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Proyek gagal dibuat.';
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
	<AdminProjectView deviceName={device.displayName} onCreate={createNew} onRenameDevice={renameDevice} />
{:else if !ready}
	<div class="loading">Menyiapkan halaman Admin…</div>
{/if}

{#if error}<div class="root-error" role="alert"><span>{error}</span><button onclick={() => (error = null)}>×</button></div>{/if}

<style>
	.loading{min-height:100vh;display:grid;place-items:center;color:#66716b}.root-error{position:fixed;z-index:100;left:50%;bottom:20px;transform:translateX(-50%);display:flex;gap:16px;align-items:center;max-width:min(560px,calc(100vw - 32px));padding:11px 14px;border-radius:7px;background:#963f27;color:white;font-size:12px;font-weight:700;box-shadow:0 14px 35px rgba(31,37,34,.22)}.root-error button{border:0;background:transparent;color:white;font-size:18px}
</style>