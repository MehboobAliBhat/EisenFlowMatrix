<script lang="ts">
  import { taskService } from "$lib/tasks.svelte";
  import DesktopLayout from "$lib/components/desktop/DesktopLayout.svelte";
  import MobileLayout from "$lib/components/mobile/MobileLayout.svelte";
</script>

{#if taskService.isMobile}
  <MobileLayout />
{:else}
  <DesktopLayout />
{/if}

<style>
  /* Global page-level styles if any */
</style>
