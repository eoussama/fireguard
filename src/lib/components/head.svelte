<script lang="ts">
  import { asset } from "$app/paths";
  import { EnumHelper } from "@eoussama/firemitt";
  import { fade, fly } from "svelte/transition";
  import { AuthStatus } from "#lib/core/enums/auth-status.enum.ts";
  import { appStore } from "#lib/core/stores/app.store.ts";



  /**
   * @description
   * The status of the authentication.
   */
  const { status }: { status: AuthStatus } = $props();

  /**
   * @description
   * The name of the current auth status.
   */
  const statusName = $derived((EnumHelper.getName(AuthStatus, status) ?? "").toLowerCase());

  /**
   * @description
   * The logo of the application, if any.
   */
  const logo = $derived($appStore.config?.logo);

  /**
   * @description
   * The icon of each status.
   */
  const icons = {
    [AuthStatus.Pending]: asset("images/pending.svg"),
    [AuthStatus.Success]: asset("images/success.svg"),
    [AuthStatus.Failure]: asset("images/failure.svg"),
  };
</script>

{#snippet statusIcon()}
  <div class="status status--{statusName}">
    {#if status === AuthStatus.Pending}
      <div class="status__ring"></div>
    {/if}
    <img alt={`Status: ${statusName}`} src={icons[status]} />
  </div>
{/snippet}

<div class="head">
  {#if logo}
    <div class="head__icon head__icon--config" transition:fly>
      <img alt={`${$appStore.config?.name} logo`} src={logo} referrerpolicy="no-referrer" />
    </div>

    <div class="head__status" transition:fly>
      {@render statusIcon()}
    </div>
  {/if}

  <div class="head__icon head__icon--fireguard" class:head__icon--muted={!logo}>
    <img class="head__fireguard" alt="Fireguard logo" src={asset("images/logo.svg")} />

    {#if !logo}
      <div class="head__overlay" transition:fade>
        {@render statusIcon()}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .head {
    display: flex;
    flex-direction: row;

    align-items: center;
    justify-content: center;

    &__icon {
      width: 80px;
      height: 80px;
      padding: 4px;
      margin: 0 10px;

      img {
        width: 100%;
      }

      &--config {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &--fireguard {
        position: relative;
        border-radius: 50%;
        margin-inline: 20px;
        background-color: rgba(var(--color-primary-rgb), 0.4);
        transition: background-color 0.6s ease;
      }

      &--muted {
        background-color: rgba(var(--color-primary-rgb), 0.15);

        .head__fireguard {
          opacity: 0.2;
        }
      }
    }

    &__fireguard {
      transition: opacity 0.6s ease;
    }

    &__status {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__overlay {
      position: absolute;
      inset: 0;

      display: flex;
      align-items: center;
      justify-content: center;

      .status {
        width: 52px;
        height: 52px;

        img {
          width: 38px;
        }

        &--pending img {
          width: 26px;
        }
      }
    }
  }

  .status {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 44px;
    height: 44px;

    img {
      width: 30px;
    }

    &__ring {
      position: absolute;
      inset: 0;

      padding: 4px;
      border-radius: 50%;
      background: var(--color-secondary);

      --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
      mask: var(--_m);

      -webkit-mask: var(--_m);
      -webkit-mask-composite: source-out;

      mask-composite: subtract;
      animation: spin 1s infinite linear;
    }

    &--pending img {
      width: 22px;
      animation: beat 1s ease-in-out infinite alternate both;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }

  @keyframes beat {
    from {
      opacity: 0.3;
    }

    to {
      opacity: 1;
    }
  }
</style>
