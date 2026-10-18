<script lang="ts">
  import { onMount } from "svelte";
  import Button from "#lib/components/button.svelte";

  import Head from "#lib/components/head.svelte";
  import { AuthStatus } from "#lib/core/enums/auth-status.enum.ts";
  import { FireguardHelper } from "#lib/core/helpers/fireguard.helper.ts";



  /**
   * @description
   * The number of intervals to count down
   */
  let iterations = $state(3);

  /**
   * @description
   * The length of a single interval in milliseconds
   */
  const interval = 1000;

  /**
   * @description
   * Whether Fireguard runs in a popup it can close by itself, unknown until mounted (the page is prerendered)
   */
  let popup = $state<boolean | null>(null);

  /**
   * @description
   * Human readable remaining time
   */
  const remainingTime = $derived(`${iterations} second${iterations === 1 ? "" : "s"}`);

  /**
   * @description
   * The countdown timer
   */
  let intervalFn: ReturnType<typeof setInterval> | undefined;

  /**
   * @description
   * Closing handler, the token was already sent to the host page.
   */
  const onClose = (): void => {
    clearInterval(intervalFn);
    FireguardHelper.close();
  };

  onMount(() => {
    popup = FireguardHelper.isPopup();

    if (popup) {
      intervalFn = setInterval(() => {
        if (--iterations <= 0) {
          onClose();
        }
      }, interval);
    }

    return () => clearInterval(intervalFn);
  });
</script>

<div class="success">
  <div class="success__head">
    <Head status={AuthStatus.Success} />
  </div>

  <div class="success__body">
    <p>Signed in successfully!</p>

    {#if popup}
      <p>Auto closing in {remainingTime}...</p>
    {:else if popup === false}
      <p>You can return to the application.</p>
    {/if}
  </div>

  {#if popup}
    <div class="success__foot">
      <Button label="Close" onclick={onClose} />
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../theme/utils/layout';

  .success {
    @include layout.pageLayout;
  }
</style>
