<script lang="ts">
  import Button from "$lib/components/button.svelte";
  import Error from "$lib/components/error.svelte";
  import Head from "$lib/components/head.svelte";
  import { AuthStatus } from "$lib/core/enums/auth-status.enum";
  import { FireguardHelper } from "$lib/core/helpers/fireguard.helper";
  import { EventHelper, EventType } from "@eoussama/firemitt";



  /**
   * @description
   * Closing handler
   */
  const onClose = (): void => {
    EventHelper.send(EventType.Closed);
    FireguardHelper.close();
  };

  /**
   * @description
   * Retry handler
   */
  const onRetry = (): void => {
    EventHelper.send(EventType.Retry);
    window.location.href = "/";
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
