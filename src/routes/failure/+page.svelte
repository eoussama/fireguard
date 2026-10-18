<script lang="ts">
  import { onMount } from "svelte";
  import Button from "#lib/components/button.svelte";
  import ErrorMessage from "#lib/components/error-message.svelte";
  import Head from "#lib/components/head.svelte";
  import { AuthStatus } from "#lib/core/enums/auth-status.enum.ts";
  import { FireguardHelper } from "#lib/core/helpers/fireguard.helper.ts";
  import { SessionHelper } from "#lib/core/helpers/session.helper.ts";
  import { appStore } from "#lib/core/stores/app.store.ts";



  /**
   * @description
   * Whether a retry is in progress.
   */
  let retrying = $state(false);

  /**
   * @description
   * Whether Fireguard was opened by a host page.
   */
  let ready = $state(false);

  /**
   * @description
   * Whether Fireguard runs in a popup it can close by itself.
   */
  let popup = $state(false);

  /**
   * @description
   * Closing handler
   */
  const onClose = (): void => {
    SessionHelper.close();
  };

  /**
   * @description
   * Retry handler, signs in again in place (from the click, so that the provider's popup is allowed).
   *
   * @returns A promise that resolves once the attempt is over.
   */
  const onRetry = async (): Promise<void> => {
    retrying = true;

    await SessionHelper.retry();

    retrying = false;
  };

  onMount(() => {
    ready = FireguardHelper.isReady();
    popup = FireguardHelper.isPopup();
  });
</script>

<!-- In iframe mode, the host removes or reloads the frame by itself, reporting from there could reach its next session. -->
<svelte:window onpagehide={() => popup && SessionHelper.abandon()} />

<div class="failure">
  <div class="failure__head">
    <Head status={retrying ? AuthStatus.Pending : AuthStatus.Failure} />
  </div>

  <div class="failure__body">
    {#if retrying}
      <p class="failure__retrying">Authentication for <b>{$appStore.config?.name}</b>...</p>
    {:else}
      <ErrorMessage />
    {/if}
  </div>

  {#if ready && $appStore.reported && !popup}
    <div class="failure__body">
      <p>You can return to the application.</p>
    </div>
  {:else if ready}
    <div class="failure__foot">
      <Button label="Close" onclick={onClose} />

      {#if $appStore.retryable && !$appStore.reported}
        <Button label="Retry" primary disabled={retrying} onclick={onRetry} />
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../theme/utils/layout';

  .failure {
    @include layout.pageLayout;

    &__retrying {
      font-size: 16px;

      b {
        font-weight: var(--font-weight-bold);
      }
    }
  }
</style>
