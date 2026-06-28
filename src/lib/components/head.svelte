<script lang="ts">
  import { AuthStatus } from "$lib/core/enums/auth-status.enum";
  import { appStore } from "$lib/core/stores/app.store";
  import { EnumHelper } from "@eoussama/firemitt";
  import { fly } from "svelte/transition";



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
   * Returns the appropriate status icon.
   *
   * @returns The icon path for the current status.
   */
  const getLoaderIcon = (): string => `images/${statusName}.svg`;

  /**
   * @description
   * Returns the appropriate classes for the icon element.
   *
   * @returns The CSS class string for the loader icon.
   */
  const getLoaderClass = (): string =>
    ["head__icon", "head__icon--loader", `head__icon--${statusName}`].join(" ");
</script>

<div class="head">
  {#if $appStore.config?.logo}
    <div class="head__icon" transition:fly>
      <img alt="App Icon" src={$appStore.config.logo} />
    </div>

    <div class={getLoaderClass()} transition:fly>
      <div class="loader"></div>
      <img alt="Status icon" src={getLoaderIcon()} />
    </div>
  {/if}

  <div class="head__icon head__icon--fireguard">
    <img alt="Fireguard Icon" src="./images/logo.svg" />
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
      padding: 8px;
      margin: 0 10px;

      img {
        width: 100%;
      }

      &--fireguard {
        border-radius: 50%;
        background-color: rgba(var(--color-primary-rgb), 0.4);
      }

      &--loader {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 35px;
        position: relative;

        img {
          max-width: 35px;
        }

        .loader {
          display: none;
          align-items: center;
          justify-content: center;

          width: 40px;
          height: 40px;
          padding: 4px;

          aspect-ratio: 1;

          border-radius: 50%;
          background: var(--color-secondary);

          --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
          mask: var(--_m);

          -webkit-mask: var(--_m);
          -webkit-mask-composite: source-out;

          mask-composite: subtract;
          animation: load 1s infinite linear;

          @keyframes load {
            to {
              transform: rotate(1turn);
            }
          }
        }
      }

      &--pending {
        img {
          position: absolute;
          top: 50%;
          left: 0;

          transform: translateY(-50%);

          animation-name: beat;
          animation-duration: 1s;
          animation-fill-mode: both;
          animation-direction: alternate;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;

          @keyframes beat {
            from {
              opacity: 0.3;
            }

            to {
              opacity: 1;
            }
          }
        }

        .loader {
          display: flex;
        }
      }
    }
  }
</style>
