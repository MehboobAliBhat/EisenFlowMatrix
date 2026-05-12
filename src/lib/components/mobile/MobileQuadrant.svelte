<script lang="ts">
  import { X } from "lucide-svelte";
  import type { QuadrantConfig } from "$lib/types";
  import { taskService } from "$lib/tasks.svelte";
  import MobileTaskCard from "./MobileTaskCard.svelte";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  let { config }: { config: QuadrantConfig } = $props();

  const tasks = $derived(taskService.getTasksByQuadrant(config.id));
  const isMiniMode = $derived(taskService.activeFilter === 'all');

  function handleZoom() {
    if (isMiniMode) {
      taskService.activeFilter = config.id.toString();
    }
  }

  function goBack() {
    taskService.activeFilter = 'all';
  }

  function purgeArchive() {
    if (config.id === 4) {
      taskService.purgeArchive();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<section 
  class="quadrant" 
  style="--q-color: var({config.var}); --q-soft: var({config.soft}); --q-header: var({config.var}-header); --q-border: color-mix(in srgb, var({config.var}), transparent 60%)"
  class:mini-mode={isMiniMode}
  onclick={handleZoom}
>
  <header class="quadrant-header">
    <div class="q-title">
      <config.icon size={18} stroke-width={3} />
      <h3>{config.title}</h3>
      <span class="q-count">[{tasks.length}]</span>
    </div>
    
    {#if !isMiniMode && config.id === 4 && tasks.length > 0}
      <button class="purge-btn" onclick={purgeArchive}>Purge</button>
    {/if}
  </header>

  <div class="task-list">
    {#each isMiniMode ? tasks.slice(0, 3) : tasks as task (task.id)}
      <div animate:flip={{ duration: 250 }}>
        <MobileTaskCard {task} isCompact={isMiniMode} />
      </div>
    {/each}
    
    {#if tasks.length === 0}
      <div class="empty-state" in:fade={{ duration: 200 }}>
        <config.icon size={24} stroke-width={1} />
        <span class="empty-text">EMPTY</span>
      </div>
    {/if}

    {#if isMiniMode && tasks.length > 3}
      <div class="more-indicator">
        +{tasks.length - 3} MORE
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
    border-radius: 4px;
    overflow: hidden;
  }

  .quadrant.mini-mode {
    padding: 10px;
  }

  .quadrant-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    min-height: 32px;
  }

  .q-title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--q-color);
    flex: 1;
  }

  .q-title h3 {
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .q-count {
    font-size: 11px;
    font-weight: 600;
    opacity: 0.6;
  }

  .purge-btn {
    font-size: 9px;
    font-weight: 900;
    background: var(--color-error);
    color: white;
    padding: 4px 10px;
    text-transform: uppercase;
  }

  .task-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0.2;
    padding: 20px;
  }

  .empty-text {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.2em;
  }

  .more-indicator {
    font-size: 10px;
    font-weight: 900;
    color: var(--q-color);
    text-align: center;
    padding: 8px;
    letter-spacing: 0.1em;
    opacity: 0.7;
    background: rgba(255, 255, 255, 0.1);
    margin-top: 4px;
  }
</style>
