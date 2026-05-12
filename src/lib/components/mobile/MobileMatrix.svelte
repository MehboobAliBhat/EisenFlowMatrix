<script lang="ts">
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import MobileQuadrant from "./MobileQuadrant.svelte";
</script>

<div class="matrix-grid" class:is-filtered={taskService.activeFilter !== 'all'}>
  {#each QUADRANTS as q}
    {#if taskService.activeFilter === 'all' || taskService.activeFilter === q.id.toString()}
      <MobileQuadrant config={q} />
    {/if}
  {/each}
</div>

<style>
  .matrix-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    min-height: 0;
    padding-bottom: 80px; /* Space for BottomNav/FAB */
  }

  .matrix-grid.is-filtered {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    padding-bottom: 20px;
  }
</style>
