<script lang="ts">
  import type { QuadrantConfig } from "$lib/types";
  import { taskService } from "$lib/tasks.svelte";
  import TaskCard from "./TaskCard.svelte";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  let { config }: { config: QuadrantConfig } = $props();

  let isDragOver = $state(false);
  const tasks = $derived(taskService.getTasksByQuadrant(config.id));

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    const taskId = e.dataTransfer?.getData("taskId");
    if (taskId) {
      taskService.moveTask(taskId, config.id);
    }
  }

  function purgeArchive() {
    if (config.id === 4) {
      taskService.purgeArchive();
    }
  }
</script>

<section 
  class="quadrant" 
  style="--q-color: var({config.var}); --q-soft: var({config.soft}); --q-header: var({config.var}-header); --q-border: color-mix(in srgb, var({config.var}), transparent 60%)"
  class:dim={config.id === 4}
  class:drag-over={isDragOver}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <header class="quadrant-header">
    <div class="q-title">
      <config.icon size={16} stroke-width={3} />
      <h3>{config.title} <span class="q-count" class:overloaded={tasks.length > 8}>[{tasks.length}]</span></h3>
    </div>
    <div class="q-meta">
      {#if config.id === 4 && tasks.length > 0}
        <button class="purge-btn industrial-hover" onclick={purgeArchive}>Purge</button>
      {/if}
      <span class="sub-label">{config.sub}</span>
    </div>
  </header>

  <div class="task-list custom-scrollbar">
    {#each tasks as task (task.id)}
      <div animate:flip={{ duration: 300 }}>
        <TaskCard {task} />
      </div>
    {/each}
    
    {#if tasks.length === 0}
      <div class="empty-state" in:fade={{ duration: 200 }}>
        <span class="empty-icon"><config.icon size={24} stroke-width={1} /></span>
        <span class="empty-text">NO ITEMS IN {config.label}</span>
      </div>
    {/if}
  </div>
</section>

<style>
  .quadrant {
    background: var(--q-soft);
    padding: 12px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    transition: all var(--transition-base);
    border: 1px solid var(--q-border);
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
  }


  .quadrant.dim {
    opacity: 0.7;
    filter: grayscale(0.5);
  }

  .quadrant.drag-over {
    border: 2px solid var(--q-color);
    background: var(--q-header);
    z-index: 5;
  }

  .quadrant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--q-header);
    margin: -12px -12px 12px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  @media (max-width: 640px) {
    .quadrant-header {
      padding: 8px 10px;
    }
    
    .q-title h3 {
      font-size: 12px;
    }

    .sub-label {
      display: none;
    }
  }

  .q-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--q-color);
  }

  .q-title h3 {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .q-count {
    font-size: 11px;
    opacity: 0.5;
    transition: all 0.2s;
  }

  .q-count.overloaded {
    color: var(--color-error);
    opacity: 1;
    font-weight: 900;
    text-shadow: 0 0 8px var(--color-error-soft);
  }

  .q-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--q-color);
  }

  .sub-label {
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .purge-btn {
    font-size: 8px;
    font-weight: 900;
    background: var(--color-error);
    color: white;
    padding: 2px 8px;
    border: 1px solid transparent;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .task-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: var(--grid-gap, 2px);
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed rgba(0,0,0,0.1);
    gap: 12px;
    opacity: 0.2;
    padding: 24px;
  }

  .empty-icon {
    color: var(--q-color);
  }

  .empty-text {
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.25em;
    text-align: center;
  }

  /* Custom Scrollbar inherited or redefined for consistency */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
  }
</style>
