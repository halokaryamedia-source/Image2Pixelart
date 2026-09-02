<script lang="ts">
	import { onMount } from 'svelte';
	import CloudProjectThumbnail from '$lib/components/CloudProjectThumbnail.svelte';
	import { listCloudProjects, registerDevice } from '$lib/cloud/api';
	import { getDeviceIdentity } from '$lib/cloud/device';
	import type { CloudProjectSummary, DeviceIdentity } from '$lib/cloud/types';

	let device = $state<DeviceIdentity | null>(null);
	let projects = $state<CloudProjectSummary[]>([]);
	let ready = $state(false);
	let error = $state<string | null>(null);
	let ownedProjects = $derived(projects.filter((project) => project.role === 'owner' && !project.deletedAt));

	onMount(() => { void initialize(); });

	async function initialize() {
		try {
			device = getDeviceIdentity();
			await registerDevice(device);
			projects = (await listCloudProjects(device)).projects;
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Daftar file Admin tidak dapat dibuka.';
		} finally {
			ready = true;
		}
	}
</script>

<svelte:head><meta name="robots" content="noindex,nofollow" /></svelte:head>

<header class="topbar">
	<a class="brand" href="/" aria-label="MIVUBI Pixel Art Editor, Akses Umum">
		<img src="/mivubi-logo.png" alt="" width="36" height="36" />
		<span><strong>MIVUBI</strong><small>PIXEL ART EDITOR</small></span>
	</a>
	<nav aria-label="Navigasi Admin"><a href="/">Akses Umum</a><a class="active" href="/admin">Admin</a></nav>
	{#if device}<span class="device">☁ {device.displayName}</span>{/if}
</header>

<main>
	<section class="intro">
		<p class="eyebrow">MODE ADMIN</p>
		<h1>Admin File</h1>
		<p>Pilih file yang ingin dikelola dengan Mode Admin.</p>
	</section>

	<section class="files" aria-labelledby="admin-files-title">
		<div class="section-heading"><h2 id="admin-files-title">File yang Dikelola</h2><span>{ownedProjects.length} file</span></div>
		{#if !ready}
			<div class="empty">Membuka file Admin…</div>
		{:else if error}
			<div class="empty error" role="alert">{error}</div>
		{:else if ownedProjects.length === 0}
			<div class="empty">Belum ada file yang dapat dikelola di Mode Admin.</div>
		{:else}
			<div class="file-grid">
				{#each ownedProjects as project}
					<article>
						<div class="thumbnail"><CloudProjectThumbnail {project} /></div>
						<div class="copy">
							<strong>{project.name}</strong>
							<span>Grid {project.columns} × {project.rows} · {project.palette.length} warna</span>
							<small>Terakhir diubah {new Date(project.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
							<a href={`/admin/project/${project.id}`}>Buka Mode Admin <i>→</i></a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.topbar{height:64px;padding:0 clamp(24px,4vw,64px);display:flex;align-items:center;border-bottom:1px solid var(--line);gap:34px;background:rgba(254,252,245,.94);position:sticky;top:0;z-index:30}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);padding-right:32px;border-right:1px solid var(--line)}.brand img{width:36px;height:36px;image-rendering:pixelated}.brand>span{display:flex;flex-direction:column;line-height:1}.brand strong{font:700 17px "Readex Pro",sans-serif;letter-spacing:.12em}.brand small{margin-top:5px;font-size:7px;font-weight:800;letter-spacing:.16em}nav{margin-right:auto;height:100%;display:flex;align-items:center;gap:24px}nav a{height:100%;display:flex;align-items:center;color:var(--ink);font-size:14px;font-weight:650;text-decoration:none;border-bottom:2px solid transparent}nav a.active{border-bottom-color:var(--forest);color:var(--forest)}.device{max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:8px 11px;border:1px solid #d7d2c4;border-radius:8px;background:#eef6f1;color:var(--forest);font-size:12px;font-weight:700}main{max-width:1240px;margin:auto;padding:42px clamp(24px,5vw,72px) 72px}.intro{margin-bottom:34px}.eyebrow{margin:0 0 9px;color:var(--accent-dark);font-size:11px;font-weight:800;letter-spacing:.14em}.intro h1{margin:0;font:700 clamp(34px,4vw,48px)/1.05 "Readex Pro",sans-serif;letter-spacing:-.04em}.intro>p:last-child{margin:10px 0 0;color:var(--muted);font-size:15px}.section-heading{display:flex;align-items:end;justify-content:space-between;margin-bottom:16px}.section-heading h2{margin:0;font:650 24px "Readex Pro",sans-serif}.section-heading span{color:var(--muted);font-size:13px}.empty{min-height:150px;display:grid;place-items:center;padding:24px;border:1px dashed #cfc9b7;border-radius:10px;background:rgba(255,255,255,.5);color:var(--muted);font-size:14px;text-align:center}.empty.error{color:var(--danger)}.file-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.file-grid article{display:grid;grid-template-columns:180px minmax(0,1fr);min-height:142px;border:1px solid #ddd8ca;border-radius:10px;background:#fff;box-shadow:0 7px 22px rgba(33,48,47,.05);overflow:hidden}.thumbnail{height:142px;background:#eef0e9;display:grid;place-items:center}.copy{min-width:0;padding:20px;display:flex;flex-direction:column}.copy strong{font:650 16px "Readex Pro",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.copy span{margin-top:8px;color:var(--forest);font-size:13px}.copy small{margin-top:7px;color:var(--muted);font-size:12px}.copy a{margin-top:auto;color:var(--forest);font-size:13px;font-weight:750;text-decoration:none}.copy i{margin-left:7px;font-style:normal}@media(max-width:820px){.file-grid{grid-template-columns:1fr}.topbar{padding:0 18px;gap:18px}.brand{padding-right:18px}nav{gap:14px}.device{display:none}}@media(max-width:560px){.topbar{gap:10px}.brand{padding-right:0;border:0}.brand small{display:none}nav{margin-left:auto}nav a:first-child{display:none}.file-grid article{grid-template-columns:120px 1fr}.thumbnail{height:132px}.copy{padding:16px 14px}main{padding:28px 16px 56px}}
</style>
