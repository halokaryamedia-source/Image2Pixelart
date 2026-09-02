<script lang="ts">
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/mivubi-logo.png" />
	<link rel="apple-touch-icon" href="/mivubi-logo.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Readex+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
	<meta name="theme-color" content="#EBB734" />
	<title>MIVUBI Image2Pixelart — Pixel Art Editor</title>
	<meta
		name="description"
		content="MIVUBI Image2Pixelart membantu membuat dan mengedit Pixel Art dari gambar atau Canvas kosong dengan Grid presisi, palet warna, dan ekspor blueprint."
	/>
	<meta property="og:title" content="MIVUBI Image2Pixelart" />
	<meta property="og:description" content="Buat dan edit Pixel Art dari gambar atau Canvas kosong." />
	<meta property="og:image" content="/mivubi-logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="MIVUBI Image2Pixelart" />
	<meta name="twitter:description" content="Buat dan edit Pixel Art dari gambar atau Canvas kosong." />
	<meta name="twitter:image" content="/mivubi-logo.png" />
</svelte:head>

{@render children()}
