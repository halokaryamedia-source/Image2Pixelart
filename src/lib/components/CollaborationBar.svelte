<script lang="ts">
	import type { PresenceParticipant } from '$lib/cloud/types';
	type Props = {
		participants: PresenceParticipant[]; deviceId: string; ownerDeviceId: string; activeEditorDeviceId: string | null;
		connectionState: 'connecting' | 'connected' | 'disconnected'; requestingEdit: boolean; revision: number;
		onRequest: () => void; onCancelRequest: () => void; onGrant: (deviceId: string) => void;
	};
	let { participants, deviceId, ownerDeviceId, activeEditorDeviceId, connectionState, requestingEdit, onRequest, onCancelRequest, onGrant }: Props = $props();
	let open = $state(false);
	let canGrant = $derived(deviceId === ownerDeviceId || deviceId === activeEditorDeviceId);
	let editable = $derived(deviceId === activeEditorDeviceId && connectionState === 'connected');
	let activeEditor = $derived(participants.find((participant) => participant.deviceId === activeEditorDeviceId));
	let copied = $state(false);
	let shouldShow = $derived(participants.length > 1 || !editable || connectionState !== 'connected' || requestingEdit);
	let connectionLabel = $derived(connectionState === 'connected' ? 'Tersambung' : connectionState === 'connecting' ? 'Menyambungkan…' : 'Koneksi terputus');

	async function copyProjectLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		window.setTimeout(() => (copied = false), 1600);
	}
</script>

{#if shouldShow}
	<div class="collaboration">
		<button class:offline={connectionState !== 'connected'} class="roster-trigger" type="button" onclick={() => (open = !open)} aria-expanded={open}>
			<i></i>{participants.length} orang · {editable ? 'Kamu mengedit' : activeEditor ? `${activeEditor.displayName} mengedit` : connectionLabel}
		</button>
		{#if !editable}
			<button class="request" type="button" onclick={requestingEdit ? onCancelRequest : onRequest} disabled={connectionState !== 'connected'}>{requestingEdit ? 'Batalkan permintaan' : 'Minta akses edit'}</button>
		{/if}
		{#if open}<div class="roster-popover">
			<header><div><strong>Kolaborasi</strong><small>{connectionLabel}</small></div><button class="copy-link" type="button" onclick={copyProjectLink}>{copied ? 'Tersalin' : 'Salin link'}</button></header>
			{#if participants.length === 0}<p>Belum ada pengguna lain yang tersambung.</p>{/if}
			{#each participants as participant}
				<div class="person"><span class:editor={participant.isEditor}>{participant.displayName.slice(0,1).toUpperCase()}</span><div><strong>{participant.displayName}{participant.deviceId === deviceId ? ' · kamu' : ''}</strong><small>{participant.isOwner && participant.isEditor ? 'Pemilik · sedang mengedit' : participant.isOwner ? 'Pemilik' : participant.isEditor ? 'Sedang mengedit' : participant.requestingEdit ? 'Meminta akses edit' : 'Hanya melihat'}</small></div>{#if canGrant && participant.deviceId !== activeEditorDeviceId}<button type="button" onclick={() => onGrant(participant.deviceId)}>{participant.requestingEdit ? 'Berikan akses' : 'Jadikan editor'}</button>{/if}</div>
			{/each}
		</div>{/if}
	</div>
{/if}

<style>
	.collaboration{position:relative;display:flex;align-items:center;gap:6px}.roster-trigger,.request{height:38px;border:1px solid #d8d3c6;border-radius:7px;background:white;padding:0 10px;color:#3f4a44;font-size:11px;font-weight:700;white-space:nowrap}.roster-trigger i{display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#16804e}.roster-trigger.offline i{background:#b46c3e}.request{border-color:#83aa94;background:#edf6f1;color:#17623f}.request:disabled{opacity:.5}.roster-popover{position:absolute;z-index:100;right:0;top:44px;width:340px;max-height:420px;overflow:auto;padding:10px;border:1px solid #d8d3c6;border-radius:10px;background:#fff;box-shadow:0 18px 45px rgba(24,35,29,.2)}.roster-popover header{display:flex;align-items:center;justify-content:space-between;padding:4px 5px 10px;border-bottom:1px solid #ebe7de}.roster-popover header>div{display:flex;flex-direction:column;gap:2px}.roster-popover header small{color:#748078;font-size:10px}.copy-link{height:28px;border:1px solid #bfd1c6;border-radius:5px;background:#edf6f1;color:#17623f;font-size:9px;font-weight:700}.roster-popover>p{padding:12px;color:#748078;font-size:12px}.person{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:8px;padding:9px 5px;border-bottom:1px solid #f0ede6}.person>span{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:#e3e8e4;color:#435149;font-weight:800}.person>span.editor{background:#1d6d49;color:white}.person>div{min-width:0;display:flex;flex-direction:column}.person strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.person small{margin-top:2px;color:#718078;font-size:9px}.person button{height:30px;border:0;border-radius:5px;background:#1f6d4a;color:white;font-size:9px;font-weight:700}@media(max-width:900px){.roster-trigger{width:38px;font-size:0}.roster-trigger i{margin:0}.request{display:none}.roster-popover{right:-50px;width:min(340px,calc(100vw - 24px))}}
</style>
