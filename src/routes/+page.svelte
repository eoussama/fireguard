<script lang="ts">
  import type { BaseError, IError, TFireguardConfig } from "@eoussama/firemitt";

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

  /**
   * @description
   * Extracts a serializable error payload from an unknown thrown value.
   *
   * @param err - The caught error value.
   * @returns A plain object matching IError.
   */
  const toErrorPayload = (err: unknown): IError => {
    if (err && typeof err === "object" && "toObject" in err && typeof (err as BaseError).toObject === "function") {
      return (err as BaseError).toObject();
    }

    const e = err as { name?: string; message?: string };

    return { type: 0 as never, name: e?.name ?? "FirebaseAuthError", message: e?.message ?? "Authentication failed." };
  };

  onMount(() => {
    const host = FireguardHelper.getHost();

    if (host && EventHelper.init(host)) {
      EventHelper.send(EventType.Loaded).on<TFireguardConfig>(
        EventType.Config,
        async (config?: TFireguardConfig) => {
          if (!config) {
            return;
          }

          ConfigHelper.load(config);
          appStore.stopLoader();

          let settled = false;
          let authPopup: Window | null = null;
          let popupPoller: ReturnType<typeof setInterval> | null = null;

          const handleFocus = (): void => {
            if (!settled) {
              settled = true;
              window.removeEventListener("focus", handleFocus);

              if (popupPoller !== null) {
                clearInterval(popupPoller);
                popupPoller = null;
              }

              onFailure("The sign-in popup was closed. Please try again.");
            }
          };

          const settle = (): void => {
            window.removeEventListener("focus", handleFocus);

            if (popupPoller !== null) {
              clearInterval(popupPoller);
              popupPoller = null;
            }
          };

          window.addEventListener("focus", handleFocus);

          const originalOpen = window.open.bind(window);

          window.open = (...args: Parameters<typeof window.open>) => {
            authPopup = originalOpen(...args);
            window.open = originalOpen;

            popupPoller = setInterval(() => {
              if (authPopup && authPopup.closed) {
                handleFocus();
              }
            }, 200);

            return authPopup;
          };

          try {
            const token = await AuthHelper.login(config.firebase, config.provider);

            settled = true;
            window.open = originalOpen;
            settle();

            onSuccess(token);
          }
          catch (err) {
            settled = true;
            window.open = originalOpen;
            settle();

            const code = (err as { code?: string })?.code;

            if (code === "auth/popup-closed-by-user") {
              onFailure("The sign-in popup was closed. Please try again.");

              return;
            }

            const message = (err as { message?: string })?.message ?? "Authentication failed.";

            onFailure(message);
            EventHelper.send(EventType.AuthFailed, { error: toErrorPayload(err) });
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
        <p>Authentication for <b>{$appStore.config?.name}</b>...</p>
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
