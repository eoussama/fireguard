<script lang="ts">
	import { onMount } from 'svelte';
	import { EventHelper, EventType } from '@eoussama/firemitt';

	import Head from '$lib/components/head.svelte';
	import Button from '$lib/components/button.svelte';

	import { appStore } from '$lib/core/stores/app.store';
	import { AuthStatus } from '$lib/core/enums/auth-status.enum';
	import { FireguardHelper } from '$lib/core/helpers/fireguard.helper';

	/**
	 * @description
	 * The number of intervals to count down
	 */
	let iterations = 3;

	/**
	 * @description
	 * The length of a single interval in milliseconds
	 */
	const interval = 1000;

	/**
	 * @description
	 * Human readable remaining time
	 */
	let remainingTime = $derived(`${iterations} second${iterations === 1 ? '' : 's'}`);

	/**
	 * @description
	 * Closing handler
	 */
	const onClose = (): void => {
		if (FireguardHelper.isReady()) {
			EventHelper.send(EventType.AuthSucceded, { token: $appStore.token });
		}

		FireguardHelper.close();
	};

	onMount(() => {
		const intervalFn = setInterval(() => {
			if (--iterations === 0) {
				onClose();
				clearInterval(intervalFn);
			}
		}, interval);
	});
</script>

<div class="success">
	<div class="success__head">
		<Head status={AuthStatus.Success} />
	</div>

	<div class="success__body">
		<p>Logged-in with success!</p>
		<p>Auto closing in {remainingTime}...</p>
	</div>

	<div class="success__foot">
		<Button label="Close" onclick={onClose} />
	</div>
</div>

<style lang="scss">
	@use '../../theme/utils/layout';

	.success {
		@include layout.pageLayout;
	}
</style>
