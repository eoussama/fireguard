<script lang="ts">
	import Head from '$lib/components/head.svelte';
	import Error from '$lib/components/error.svelte';
	import Button from '$lib/components/button.svelte';

	import { Page } from '$lib/core/enums/page.enum';
	import { AuthStatus } from '$lib/core/enums/auth-status.enum';

	import { FireguardHelper } from '$lib/core/helpers/fireguard.helper';

	/**
	 * @description
	 * Closing handler
	 */
	const onClose = (): void => {
		FireguardHelper.close();
	};

	/**
	 * @description
	 * Retry handler
	 */
	const onRetry = (): void => {
		FireguardHelper.navigate(Page.Index).then((e) => location.reload());
	};
</script>

<div class="failure">
	<div class="failure__head">
		<Head status={AuthStatus.Failure} />
	</div>

	<div class="failure__body">
		<Error />
	</div>

	<div class="failure__foot">
		<Button label="Close" onclick={onClose} />
		<Button label="Retry" primary onclick={onRetry} />
	</div>
</div>

<style lang="scss">
	.failure {
		display: flex;
		flex-direction: column;

		align-items: center;
		justify-content: center;

		margin-bottom: 20px;

		&__head {
			margin-top: 20px;
		}

		&__body {
			margin-top: 10px;
			text-align: center;
		}

		&__foot {
			margin-top: 15px;
		}
	}
</style>
