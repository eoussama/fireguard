<script lang="ts">
  import { PUBLIC_VERSION } from "$env/static/public";
</script>

<div class="foot">
	<p class="foot__note">Make sure you're not blocking popups on this page.</p>
	<p class="foot__note">
		Powered by <a target="_blank" href="https://github.com/eoussama/fireguard">Fireguard</a>
		v{PUBLIC_VERSION}
	</p>
</div>

<style lang="scss">
  .foot {
    &__note {
      color: grey;
      font-size: 12px;
    }

    a {
      padding: 0 2px;
      position: relative;

      text-decoration: none;
      color: hsl(var(--color-primary-hsl), 35%);

      &::before {
        content: '';

        top: 0;
        left: 0;
        position: absolute;

        width: 0;
        height: 100%;

        border-radius: 5px;
        background-color: rgba(var(--color-primary-rgb), 0.15);

        transition-duration: 0.2s;
        transition-property: width;
      }

      &:hover::before {
        width: 100%;
      }
    }
  }
</style>
