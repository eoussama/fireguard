<script lang="ts">
  import { appStore } from "#lib/core/stores/app.store.ts";
</script>

<div class="error" role="alert">{$appStore.errorMsg}</div>

<style lang="scss">
  .error {
    font-size: 14px;
    color: var(--color-error);
    font-weight: var(--font-weight-bold);
  }
</style>
