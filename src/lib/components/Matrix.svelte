<script lang="ts">
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import Quadrant from "./Quadrant.svelte";
</script>

<div class="matrix-grid">
  {#each QUADRANTS as q}
    {#if taskService.activeFilter === 'all' || taskService.activeFilter === q.id.toString()}
      <Quadrant config={q} />
    {/if}
  {/each}
</div>

<style>
  .matrix-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--grid-gap);
    min-height: 0;
  }

  @media (max-width: 768px) {
    .matrix-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 1fr);
      overflow-y: auto;
      padding-bottom: 20px;
    }
  }

  /* Handle full-width view when only one quadrant is filtered */
  :global(.matrix-grid:has(> section:only-of-type)) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
</style>
