<script lang="ts">
  import { Trash2 } from "lucide-svelte";
  import type { Task } from "$lib/types";
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import Checkbox from "./Checkbox.svelte";

  let { task }: { task: Task } = $props();

  const currentQuadrant = $derived(QUADRANTS.find(q => q.id === task.quadrant));
  const otherQuadrants = $derived(QUADRANTS.filter(q => q.id !== task.quadrant));

  let isEditing = $state(false);
  let editText = $state(task.text);
  let editInput: HTMLInputElement;

  function handleDragStart(e: DragEvent) {
    if (isEditing) return;
    if (e.dataTransfer) {
      e.dataTransfer.setData("taskId", task.id);
      e.dataTransfer.effectAllowed = "move";
    }
  }

  function startEditing() {
    editText = task.text;
    isEditing = true;
    setTimeout(() => editInput?.focus(), 0);
  }

  function saveEdit() {
    if (editText.trim() && editText !== task.text) {
      task.text = editText.trim();
      taskService.save();
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
    editText = task.text;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="task-card industrial-hover" 
  class:editing={isEditing}
  draggable={!isEditing}
  ondragstart={handleDragStart}
  style="--q-color: var({currentQuadrant?.var || '--color-primary'})"
>
  <div class="task-left">
    <Checkbox 
      bind:checked={task.completed} 
      color={currentQuadrant?.var ? `var(${currentQuadrant.var})` : 'var(--color-primary)'}
      onchange={() => taskService.save()}
    />
    
    {#if isEditing}
      <input
        bind:this={editInput}
        bind:value={editText}
        onblur={saveEdit}
        onkeydown={handleKeydown}
        class="edit-input"
      />
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <span 
        class="task-text" 
        class:completed={task.completed}
        onclick={startEditing}
      >
        {task.text}
      </span>
    {/if}
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

  .edit-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: var(--font-size-task, 12px);
    font-weight: 600;
    color: var(--text-primary);
    padding: 0;
    margin: 0;
    width: 100%;
  }

  .task-card.editing {
    border-color: var(--q-color);
    background: var(--bg-app);
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
</style>
