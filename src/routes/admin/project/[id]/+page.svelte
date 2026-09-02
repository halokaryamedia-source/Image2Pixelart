<script lang="ts">
	import { page } from '$app/state';
	import ProjectEditorRoute from '$lib/components/ProjectEditorRoute.svelte';
</script>

<ProjectEditorRoute projectId={page.params.id!} adminMode />
