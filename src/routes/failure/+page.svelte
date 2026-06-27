<script lang="ts">
  import Button from "$lib/components/button.svelte";
  import Error from "$lib/components/error.svelte";
  import Head from "$lib/components/head.svelte";
  import { AuthStatus } from "$lib/core/enums/auth-status.enum";
  import { Page } from "$lib/core/enums/page.enum";
  import { FireguardHelper } from "$lib/core/helpers/fireguard.helper";



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
    FireguardHelper.navigate(Page.Index).then(() => location.reload());
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
  @use '../../theme/utils/layout';

  .failure {
    @include layout.pageLayout;
  }
</style>
