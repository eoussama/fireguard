<script lang="ts">
	import { fly } from 'svelte/transition';

	import { appStore } from '$lib/core/stores/app.store';
	import { AuthStatus } from '$lib/core/enums/auth-status.enum';
	import { EnumHelper } from '@eoussama/firemitt';

	/**
	 * @description
	 * The status of the authentication.
	 */
	let { status }: { status: AuthStatus } = $props();

	/**
	 * @description
	 * Returns the appropriate status icon.
	 */
	const getLoaderIcon = (): string => {
		const base = 'images';
		const iconName = EnumHelper.getName(AuthStatus, status);

		return `${base}/${iconName}.svg`.toLowerCase();
	};

	/**
	 * @description
	 * Returns the appropriate classes for the icon element.
	 */
	const getLoaderClass = (): string => {
		const classes = [
			'head__icon',
			'head__icon--loader',
			`head__icon--${EnumHelper.getName(AuthStatus, status)}`
		];

		return classes.join(' ').toLowerCase();
	};
</script>

<div class="head">
	{#if $appStore.config?.logo}
		<div class="head__icon" transition:fly>
			<img alt="App Icon" src={$appStore.config.logo} />
		</div>

		<div class={getLoaderClass()} transition:fly>
			<div class="loader"></div>
			<img alt="Status icon" src={getLoaderIcon()} />
		</div>
	{/if}

	<div class="head__icon">
		<img alt="Fireguard Icon" src="./images/logo.svg" />
	</div>
</div>

<style lang="scss">
	.head {
		display: flex;
		flex-direction: row;

		align-items: center;
		justify-content: center;

		&__icon {
			width: 70px;
			margin: 0 10px;

			img {
				width: 100%;
			}

			&--loader {
				width: 35px;
				position: relative;

				.loader {
					display: none;

					position: absolute;
					top: -3px;
					left: -2px;

					width: 40px;
					padding: 4px;

					aspect-ratio: 1;

					border-radius: 50%;
					background: var(--color-secondary);

					--_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
					mask: var(--_m);

					-webkit-mask: var(--_m);
					-webkit-mask-composite: source-out;

					mask-composite: subtract;
					animation: load 1s infinite linear;

					@keyframes load {
						to {
							transform: rotate(1turn);
						}
					}
				}
			}

			&--pending {
				img {
					animation-name: beat;
					animation-duration: 1s;
					animation-fill-mode: both;
					animation-direction: alternate;
					animation-iteration-count: infinite;
					animation-timing-function: ease-in-out;

					@keyframes beat {
						from {
							opacity: 0.3;
						}

						to {
							opacity: 1;
						}
					}
				}

				.loader {
					display: block;
				}
			}
		}
	}
</style>
