<script lang="ts">
  import { X, Zap, Calendar, Repeat, CornerDownLeft } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
  import { onMount } from "svelte";

  let newTaskText = $state('');
  let selectedQuadrant = $state(1);
  let inputElement = $state<HTMLTextAreaElement>();

  $effect(() => {
    if (taskService.isMobileCaptureOpen) {
      // Small delay to allow the slide-up animation to start and DOM to be ready
      const timer = setTimeout(() => {
        inputElement?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  });

  function addTask() {
    if (newTaskText.trim()) {
      taskService.addTask(newTaskText, selectedQuadrant);
      newTaskText = '';
      taskService.isMobileCaptureOpen = false;
    }
  }

  const quadrants = [
    { id: 1, label: 'Do', icon: Zap, color: 'var(--color-q1)' },
    { id: 2, label: 'Plan', icon: Calendar, color: 'var(--color-q2)' },
    { id: 3, label: 'Delegate', icon: Repeat, color: 'var(--color-q3)' }
  ];
</script>

{#if taskService.isMobileCaptureOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="mobile-capture-overlay" onclick={() => taskService.isMobileCaptureOpen = false}>
    <div class="capture-panel" onclick={e => e.stopPropagation()}>
      <div class="panel-header">
        <h3>New Precision Task</h3>
        <button class="close-btn" onclick={() => taskService.isMobileCaptureOpen = false}>
          <X size={20} />
        </button>
      </div>

      <div class="input-container">
        <textarea 
          bind:this={inputElement}
          bind:value={newTaskText}
          placeholder="What needs attention?"
          rows="3"
        ></textarea>
      </div>

      <div class="quadrant-selector">
        <span class="selector-label">SELECT FOCUS</span>
        <div class="quadrant-options">
          {#each quadrants as q}
            <button 
              class="option-btn" 
              class:active={selectedQuadrant === q.id}
              onclick={() => selectedQuadrant = q.id}
              style="--q-color: {q.color}"
            >
              <q.icon size={18} />
              <span>{q.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <button 
        class="submit-btn" 
        disabled={!newTaskText.trim()}
        onclick={addTask}
      >
        <span>INITIALIZE TASK</span>
        <CornerDownLeft size={16} />
      </button>
    </div>
  </div>
{/if}

<style>
  .mobile-capture-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
  }

  .capture-panel {
    width: 100%;
    background: var(--bg-sidebar);
    border-top: 2px solid var(--color-primary);
    border-radius: 20px 20px 0 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: slide-up 0.3s var(--spring-easing);
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }

  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header h3 {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-primary);
  }

  .close-btn {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .input-container textarea {
    width: 100%;
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 16px;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    resize: none;
    outline: none;
  }

  .input-container textarea:focus {
    border-color: var(--color-primary);
  }

  .quadrant-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .selector-label {
    font-size: 10px;
    font-weight: 900;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }

  .quadrant-options {
    display: flex;
    gap: 8px;
  }

  .option-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    color: var(--text-secondary);
    transition: all var(--transition-fast);
  }

  .option-btn.active {
    background: color-mix(in srgb, var(--bg-surface), var(--q-color) 20%);
    border-color: var(--q-color);
    color: var(--q-color);
    font-weight: 800;
  }

  .option-btn span {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
  }

  .submit-btn {
    width: 100%;
    height: 52px;
    background: var(--color-primary);
    color: #ffffff;
    border: none;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    background: var(--text-muted);
  }
</style>
