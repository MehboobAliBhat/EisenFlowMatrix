<script lang="ts">
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import DesktopQuadrant from "./DesktopQuadrant.svelte";
</script>

<div class="matrix-grid">
  {#each QUADRANTS as q}
    {#if taskService.activeFilter === 'all' || taskService.activeFilter === q.id.toString()}
      <DesktopQuadrant config={q} />
    {/if}
  {/each}
</div>

<style>
  .matrix-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    min-height: 0;
  }

  /* Handle full-width view when only one quadrant is filtered */
  :global(.matrix-grid:has(> section:only-of-type)) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
</style>
