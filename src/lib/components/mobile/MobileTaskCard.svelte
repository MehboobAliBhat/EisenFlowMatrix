<script lang="ts">
  import { Trash2, MoveHorizontal } from "lucide-svelte";
  import type { Task } from "$lib/types";
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import Checkbox from "../Checkbox.svelte";

  let { task, isCompact = false }: { task: Task, isCompact?: boolean } = $props();

  const currentQuadrant = $derived(QUADRANTS.find(q => q.id === task.quadrant));
  
  let isEditing = $state(false);
  let editText = $state('');
  let editInput = $state<HTMLInputElement>();
  let showActions = $state(false);

  function startEditing() {
    if (isCompact) return;
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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') isEditing = false;
  }

  function toggleActions() {
    if (isCompact) return;
    showActions = !showActions;
  }

  function moveTask(qId: number) {
    taskService.moveTask(task.id, qId);
    showActions = false;
  }
</script>

<div 
  class="task-card" 
  class:compact={isCompact}
  class:editing={isEditing}
  style="--q-color: var({currentQuadrant?.var || '--color-primary'})"
>
  <div class="task-main">
    {#if !isCompact}
      <div class="checkbox-wrapper">
        <Checkbox 
          bind:checked={task.completed} 
          color={currentQuadrant?.var ? `var(${currentQuadrant.var})` : 'var(--color-primary)'}
          onchange={() => taskService.save()}
        />
      </div>
    {/if}
    
    <div 
      class="text-area" 
      onclick={startEditing}
      onkeydown={e => (e.key === 'Enter' || e.key === ' ') && startEditing()}
      role="button"
      tabindex="0"
      aria-label={`Edit task: ${task.text}`}
    >
      {#if isEditing}
        <input
          bind:this={editInput}
          bind:value={editText}
          onblur={saveEdit}
          onkeydown={handleKeydown}
          class="edit-input"
        />
      {:else}
        <span class="task-text" class:completed={task.completed}>
          {task.text}
        </span>
      {/if}
    </div>

    {#if !isCompact && !isEditing}
      <button class="more-btn" onclick={toggleActions} aria-label="Task Actions">
        <MoveHorizontal size={18} />
      </button>
    {/if}
  </div>

  {#if showActions}
    <div class="actions-overlay">
      <div class="actions-grid">
        {#each QUADRANTS as q}
          {#if q.id !== task.quadrant}
            <button class="action-item" onclick={() => moveTask(q.id)}>
              <q.icon size={18} />
              <span>{q.label}</span>
            </button>
          {/if}
        {/each}
        <button class="action-item delete" onclick={() => taskService.deleteTask(task.id)}>
          <Trash2 size={18} />
          <span>DELETE</span>
        </button>
      </div>
      <button class="close-overlay" onclick={() => showActions = false}>CANCEL</button>
    </div>
  {/if}
</div>

<style>
  .task-card {
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    margin-bottom: 4px;
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
  }

  .task-card.compact {
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    margin-bottom: 2px;
    border-radius: var(--radius);
  }

  .task-main {
    display: flex;
    align-items: center;
    padding: 12px;
    gap: 12px;
    min-height: 48px;
  }

  .task-card.compact .task-main {
    padding: 6px 10px;
    min-height: 32px;
    gap: 10px;
  }

  .checkbox-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .text-area {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .task-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-card.compact .task-text {
    font-size: 11px;
    font-weight: 600;
  }

  .task-text.completed {
    text-decoration: line-through;
    opacity: 0.5;
  }

  .edit-input {
    width: 100%;
    background: transparent;
    border: none;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    border-bottom: 1px solid var(--color-primary);
  }

  .more-btn {
    padding: 8px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Actions Overlay - Laws of UX: Hick's Law (Clear, focused choices) */
  .actions-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-surface);
    z-index: 20;
    display: flex;
    flex-direction: column;
    animation: slide-up 0.2s ease-out;
  }

  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .actions-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border-color);
  }

  .action-item {
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 800;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .action-item:active {
    background: var(--outline-color);
  }

  .action-item.delete {
    color: var(--color-error);
  }

  .close-overlay {
    height: 32px;
    background: var(--bg-app);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.1em;
    border-top: 1px solid var(--border-color);
  }
</style>
