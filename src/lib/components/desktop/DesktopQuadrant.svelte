<script lang="ts">
  import { X } from "lucide-svelte";
  import type { QuadrantConfig } from "$lib/types";
  import { taskService } from "$lib/tasks.svelte";
  import DesktopTaskCard from "./DesktopTaskCard.svelte";
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
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
        <DesktopTaskCard {task} />
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

  .quadrant.drag-over {
    background: color-mix(in srgb, var(--q-color), transparent 85%);
    border-color: var(--q-color);
    transform: scale(1.005);
  }

  .quadrant-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 4px;
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
    text-transform: uppercase;
  }

  .q-count {
    font-size: 11px;
    opacity: 0.5;
  }

  .q-count.overloaded {
    color: var(--color-error);
    opacity: 1;
    font-weight: 900;
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
    border: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .task-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0.2;
    padding: 24px;
    border: 1px dashed var(--q-border);
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

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
  }
</style>
