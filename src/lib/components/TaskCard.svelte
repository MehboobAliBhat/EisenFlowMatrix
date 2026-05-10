<script lang="ts">
  import { Trash2, ArrowRightLeft } from "lucide-svelte";
  import type { Task } from "$lib/types";
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import Checkbox from "./Checkbox.svelte";

  let { task }: { task: Task } = $props();
  let showTransport = $state(false);

  const currentQuadrant = $derived(QUADRANTS.find(q => q.id === task.quadrant));
  const otherQuadrants = $derived(QUADRANTS.filter(q => q.id !== 4));

  function handleDragStart(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.setData("taskId", task.id);
      e.dataTransfer.effectAllowed = "move";
    }
  }

  function handleMove(qId: number) {
    taskService.moveTask(task.id, qId);
    showTransport = false;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="task-card industrial-hover" 
  draggable="true" 
  ondragstart={handleDragStart}
  style="--q-color: var({currentQuadrant?.var || '--color-primary'})"
  onmousedown={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'}
  onmouseup={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
  onmouseleave={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
>
  <div class="task-left">
    <Checkbox 
      bind:checked={task.completed} 
      color={currentQuadrant?.var ? `var(${currentQuadrant.var})` : 'var(--color-primary)'}
      onchange={() => taskService.save()}
    />
    <span class="task-text" class:completed={task.completed}>{task.text}</span>
  </div>
  
  <div class="task-actions">
    <div class="transport-wrapper">
      <button 
        class="action-btn industrial-hover-subtle transport-trigger" 
        onclick={() => showTransport = !showTransport}
        title="Move task"
      >
        <ArrowRightLeft size={15} />
      </button>

      {#if showTransport}
        <div class="transport-menu" onmouseleave={() => showTransport = false}>
          {#each otherQuadrants as target}
            <button 
              class="menu-item"
              class:active={target.id === task.quadrant}
              onclick={() => handleMove(target.id)}
              style="--m-color: var({target.var})"
            >
              <target.icon size={12} />
              <span>{target.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <button 
      class="action-btn delete industrial-hover-subtle" 
      onclick={() => taskService.deleteTask(task.id)}
      title="Delete task"
    >
      <Trash2 size={16}/>
    </button>
  </div>
</div>

<style>
  .task-card {
    height: var(--card-height);
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--card-padding);
    margin-bottom: 2px;
    cursor: grab;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-radius: var(--radius);
    position: relative;
  }

  .task-card:hover {
    border-color: var(--q-color);
    transform: translateX(4px);
  }

  .task-card:active {
    cursor: grabbing;
  }

  .task-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .task-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.2s;
  }

  .task-text.completed {
    text-decoration: line-through;
    opacity: 0.4;
  }

  .task-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .task-card:hover .task-actions {
    opacity: 1;
  }

  .transport-wrapper {
    position: relative;
  }

  .transport-menu {
    position: absolute;
    bottom: 100%;
    right: 0;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    min-width: 100px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    text-align: left;
    transition: all 0.2s;
    cursor: pointer;
  }

  .menu-item:hover {
    background: var(--bg-app);
    color: var(--m-color);
  }

  .menu-item.active {
    color: var(--m-color);
    background: color-mix(in srgb, var(--m-color), transparent 90%);
  }

  .action-btn {
    padding: 8px;
    color: var(--text-muted);
    border: 1px solid transparent;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius);
    transition: all 0.2s;
  }

  .industrial-hover-subtle:hover {
    color: var(--color-primary);
  }

  .delete:hover {
    color: var(--color-error) !important;
  }
</style>
