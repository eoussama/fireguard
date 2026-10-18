<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  import Head from "#lib/components/head.svelte";
  import { AuthStatus } from "#lib/core/enums/auth-status.enum.ts";
  import { ConfigHelper } from "#lib/core/helpers/config.helper.ts";
  import { FireguardHelper } from "#lib/core/helpers/fireguard.helper.ts";
  import { HandshakeHelper } from "#lib/core/helpers/handshake.helper.ts";
  import { SessionHelper } from "#lib/core/helpers/session.helper.ts";
  import { appStore } from "#lib/core/stores/app.store.ts";



  onMount(() => {
    const host = FireguardHelper.getHost();

    if (!host) {
      SessionHelper.fail(new Error("Fireguard has to be opened by an external page."));

      return;
    }

    return HandshakeHelper.start(host, {
      onConfig: (config, origin) => {
        SessionHelper.begin(origin);

        try {
          ConfigHelper.load(config);
        }
        catch (err) {
          SessionHelper.fail(err);

          return;
        }
        finally {
          appStore.stopLoader();
        }

        SessionHelper.login();
      },
      onTimeout: () => {
        SessionHelper.fail(new Error("Could not reach the application that opened Fireguard. Close this window and try again."));
      },
    });
  });
</script>

<div class="content">
  <div class="content__head">
    <Head status={AuthStatus.Pending} />
  </div>

  <div class="content__body">
    {#if $appStore.loading}
      <p class="content__waiting">Connecting to the application...</p>
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

    &__waiting {
      margin: 10px 0;
      color: grey;
      font-size: 14px;
    }

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
