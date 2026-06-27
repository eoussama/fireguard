<script lang="ts">
	import type { Snippet } from 'svelte';

	import '../theme/main.scss';
	import Foot from '$lib/components/foot.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>Fireguard</title>
</svelte:head>

<div class="root">
	<main class="body">
		{@render children()}
	</main>

	<footer class="foot">
		<Foot />
	</footer>
</div>

<style lang="scss">
	.root {
		position: relative;

		text-align: center;

		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
	}
</style>
