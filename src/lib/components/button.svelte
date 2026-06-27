<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	/**
	 * @description
	 * If the button is primary
	 */

	/**
	 * @description
	 * The label of the button
	 */

	/**
	 * @description
	 * Click handler callback
	 */
	let {
		primary = false,
		label = 'Click Me!',
		onclick
	}: {
		primary?: boolean;
		label?: string;
		onclick?: MouseEventHandler<HTMLButtonElement>;
	} = $props();
</script>

<button class="btn" class:btn--primary={primary} {onclick}>{label}</button>

<style lang="scss">
	.btn {
		cursor: pointer;

		border: none;
		border-radius: 5px;
		padding: 10px 20px;

		transition-duration: 0.2s;
		transition-property: background-color;

		color: var(--color-text);
		font-family: var(--font-primary);
		background-color: rgba(var(--color-primary-rgb), 0.2);

		&:hover {
			background-color: rgba(var(--color-primary-rgb), 0.4);
		}

		&--primary {
			background-color: rgba(var(--color-primary-rgb), 0.4);

			&:hover {
				background-color: rgba(var(--color-primary-rgb), 0.6);
			}
		}
	}
</style>
