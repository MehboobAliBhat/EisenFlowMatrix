<script lang="ts">
  import { Trash2 } from "lucide-svelte";
  import type { Task } from "$lib/types";
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import Checkbox from "./Checkbox.svelte";

  let { task }: { task: Task } = $props();

  const currentQuadrant = $derived(QUADRANTS.find(q => q.id === task.quadrant));
  const otherQuadrants = $derived(QUADRANTS.filter(q => q.id !== task.quadrant));

  function handleDragStart(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.setData("taskId", task.id);
      e.dataTransfer.effectAllowed = "move";
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="task-card industrial-hover" 
  draggable="true" 
  ondragstart={handleDragStart}
  style="--q-color: var({currentQuadrant?.var || '--color-primary'})"
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
    {#each otherQuadrants as target}
      <button 
        class="action-btn industrial-hover-subtle" 
        onclick={() => taskService.moveTask(task.id, target.id)} 
        title={target.id === 4 ? "Archive task" : `Move to ${target.label}`}
        style="--m-color: var({target.var})"
      >
        <target.icon size={15} />
      </button>
    {/each}
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
    transition: all var(--transition-base);
    border-radius: var(--radius);
    position: relative;
  }

  .task-card:hover {
    border-color: var(--q-color);
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
    font-size: var(--font-size-task, 12px);
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all var(--transition-base);
  }

  .task-text.completed {
    text-decoration: line-through;
    opacity: 0.4;
  }

  .task-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  .task-card:hover .task-actions {
    opacity: 1;
  }

  .action-btn {
    padding: 8px;
    color: var(--text-muted);
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius);
    transition: color var(--transition-fast);
  }

  .industrial-hover-subtle:hover {
    color: var(--m-color, var(--color-primary)) !important;
    background: transparent !important;
  }

  .delete:hover {
    color: var(--color-error) !important;
  }
</style>
