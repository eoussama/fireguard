<script lang="ts">
  import type { BaseError, TFireguardConfig } from "@eoussama/firemitt";

  import Head from "$lib/components/head.svelte";
  import Loader from "$lib/components/loader.svelte";

  import { AuthStatus } from "$lib/core/enums/auth-status.enum";
  import { Page } from "$lib/core/enums/page.enum";
  import { AuthHelper } from "$lib/core/helpers/auth.helper";
  import { ConfigHelper } from "$lib/core/helpers/config.helper";
  import { FireguardHelper } from "$lib/core/helpers/fireguard.helper";
  import { appStore } from "$lib/core/stores/app.store";
  import { EventHelper, EventType } from "@eoussama/firemitt";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";



  /**
   * @description
   * Failure handler
   *
   * @param error The error to show
   */
  const onFailure = (error: string): void => {
    appStore.stopLoader();
    appStore.raiseError(error);

    FireguardHelper.navigate(Page.Failure);
  };

  /**
   * @description
   * Success handler
   *
   * @param token The token to send back
   */
  const onSuccess = (token: string): void => {
    appStore.clearError();
    appStore.registerToken(token);

    FireguardHelper.navigate(Page.Success);
  };

  onMount(() => {
    if (EventHelper.init(window.opener)) {
      EventHelper.send(EventType.Loaded).on<TFireguardConfig>(
        EventType.Config,
        async (config?: TFireguardConfig) => {
          try {
            if (config) {
              ConfigHelper.load(config);
              appStore.stopLoader();

              const token = await AuthHelper.login(config.firebase);

              onSuccess(token);
            }
          }
          catch (err) {
            const error = err as BaseError & { code?: string };

            if (error.code === "auth/popup-closed-by-user") {
              FireguardHelper.close();

              return;
            }

            onFailure(error.message);
            EventHelper.send(EventType.AuthFailed, { error: error.toObject() });
          }
        },
      );
    }
    else {
      onFailure("Fireguard has to be opened by an external page.");
    }
  });
</script>

<div class="content">
  <div class="content__head">
    <Head status={AuthStatus.Pending} />
  </div>

  <div class="content__body">
    {#if $appStore.loading}
      <div class="content__loader">
        <Loader />
      </div>
    {:else}
      <div class="content__message" in:fly={{ y: 5, duration: 1000 }}>
        <p>Google Authentication for <b>{$appStore.config?.name}</b>...</p>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .content {
    margin: auto;
    padding: 10px;

    width: 100%;
    max-width: 320px;

    &__message {
      font-size: 16px;
      font-weight: var(--font-weight-regular);

      margin: 10px 0;

      b {
        font-weight: var(--font-weight-bold);
      }
    }
  }
</style>
