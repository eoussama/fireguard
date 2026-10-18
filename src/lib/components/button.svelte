<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";



  const {
    primary = false,
    disabled = false,
    label = "Click Me!",
    onclick,
  }: {
    /**
     * @description
     * If the button is primary
     */
    primary?: boolean;

    /**
     * @description
     * If the button is disabled
     */
    disabled?: boolean;

    /**
     * @description
     * The label of the button
     */
    label?: string;

    /**
     * @description
     * Click handler callback
     */
    onclick?: MouseEventHandler<HTMLButtonElement>;
  } = $props();
</script>

<button type="button" class="btn" class:btn--primary={primary} {disabled} {onclick}>{label}</button>

<style lang="scss">
  .btn {
    cursor: pointer;

    border: none;
    border-radius: 5px;
    padding: 10px 20px;

    transition-duration: 0.2s;
    transition-property: background-color;

    color: var(--color-text);
    font-family: var(--font-family-primary);
    background-color: rgba(var(--color-primary-rgb), 0.2);

    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.4);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--primary {
      background-color: rgba(var(--color-primary-rgb), 0.4);

      &:hover {
        background-color: rgba(var(--color-primary-rgb), 0.6);
      }
    }
  }
</style>
