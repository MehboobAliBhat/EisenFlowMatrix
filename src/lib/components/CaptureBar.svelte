<script lang="ts">
  import { Zap, CornerDownLeft } from "lucide-svelte";
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import { onMount } from 'svelte';

  let newTaskText = $state('');
  let selectedQuadrant = $state(1);
  let inputElement: HTMLInputElement;
  let targetButtons = $state<HTMLButtonElement[]>([]);
  let isSuccessActive = $state(false);
  let isFocused = $state(false);

  const ActiveIcon = $derived(QUADRANTS.find(q => q.id === selectedQuadrant)?.icon || Zap);
  
  onMount(() => {
    inputElement?.focus();
  });

  const placeholders = {
    1: "What critical task needs immediate action?",
    2: "What is important but can wait for later?",
    3: "Who can handle this non-critical task?"
  };

  function addTask(explicitQuadrant?: number) {
    if (newTaskText.trim()) {
      taskService.addTask(newTaskText, explicitQuadrant ?? selectedQuadrant);
      newTaskText = '';
      
      // Brief static feedback
      isSuccessActive = true;
      setTimeout(() => isSuccessActive = false, 200);
    }
    inputElement?.focus();
  }

  function registerButton(node: HTMLButtonElement, index: number) {
    targetButtons[index] = node;
  }

  function handleTargetClick(qId: number) {
    selectedQuadrant = qId;
    addTask();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      const activeIdx = QUADRANTS.findIndex(q => q.id === selectedQuadrant);
      
      if (e.shiftKey) {
        if (document.activeElement === inputElement) {
          e.preventDefault();
          targetButtons[2]?.focus();
        } else if (document.activeElement === targetButtons[0]) {
          e.preventDefault();
          inputElement?.focus();
        }
      } else {
        if (document.activeElement === inputElement) {
          e.preventDefault();
          const nextBtnIdx = activeIdx < 2 ? activeIdx + 1 : 0;
          targetButtons[nextBtnIdx]?.focus();
        } else if (document.activeElement === targetButtons[2]) {
          e.preventDefault();
          inputElement?.focus();
        }
      }
    } else if (e.key === 'Enter') {
      if (document.activeElement === inputElement || targetButtons.includes(document.activeElement as HTMLButtonElement)) {
        e.preventDefault();
        addTask();
      }
    }
  }
</script>

<div 
  class="capture-console" 
  class:is-focused={isFocused}
  style="--active-q-color: var(--color-q{selectedQuadrant}); --active-q-bg: var(--color-q{selectedQuadrant}-soft)"
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="console-inner" onclick={() => inputElement?.focus()}>
    <div class="console-left">
      <div class="status-indicator">
        <ActiveIcon 
          size={16} 
          class="charge-icon {isSuccessActive ? 'success-blink' : ''}" 
          style="color: var(--active-q-color)" 
        />
      </div>
    </div>

    <div class="input-section">
      <div class="input-relative">
        <input 
          bind:this={inputElement} 
          bind:value={newTaskText} 
          placeholder={placeholders[selectedQuadrant as keyof typeof placeholders]} 
          onkeydown={handleKeyDown}
          onfocus={() => isFocused = true}
          onblur={() => isFocused = false}
        />

        {#if newTaskText}
          <div class="kbd-hint dynamic-hint">
            <span>ENTER</span>
            <CornerDownLeft size={10} />
          </div>
        {/if}
      </div>
    </div>

    <div class="console-right" onclick={e => e.stopPropagation()}>
      <div class="capture-targets">
        {#each QUADRANTS.slice(0,3) as q, i}
          <button 
            use:registerButton={i}
            class="target-btn" 
            class:active={selectedQuadrant === q.id}
            onclick={() => handleTargetClick(q.id)}
            onfocus={() => selectedQuadrant = q.id}
            onkeydown={handleKeyDown}
            style="--q-bg: var({q.soft}); --q-color: var({q.var})"
          >
            <span class="q-label">{q.label}</span>
            <span class="shortcut-badge">{i + 1}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .capture-console {
    background: var(--bg-surface);
    border: 2px solid var(--outline-color);
    position: relative;
    flex-shrink: 0;
    border-radius: var(--radius);
    /* Ensure no transitions on the container itself to avoid flickering */
    transition: border-color 0.1s linear;
  }

  .console-inner {
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 12px;
  }

  @media (max-width: 640px) {
    .console-inner {
      height: 48px;
      padding: 0 8px;
    }
    
    .console-left {
      padding-right: 8px;
    }
    
    .input-section {
      padding: 0 8px;
    }
    
    .console-right {
      padding-left: 8px;
    }

    .q-label {
      display: none;
    }
    
    .target-btn {
      padding: 0 8px;
      gap: 0;
    }
  }

  .console-left {
    display: flex;
    align-items: center;
    padding-right: 16px;
    border-right: 1px solid var(--border-color);
  }

  .input-section {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 16px;
    cursor: text;
    position: relative;
  }

  .input-relative {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .input-section input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    caret-color: var(--active-q-color);
  }

  .input-section input:focus {
    font-size: 15px;
  }

  .kbd-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
    opacity: 0.8;
    white-space: nowrap;
  }

  .dynamic-hint {
    position: absolute;
    right: 0;
    z-index: 5;
    pointer-events: none;
  }

  .console-right {
    display: flex;
    justify-content: flex-end;
    padding-left: 16px;
    border-left: 1px solid var(--border-color);
  }

  .capture-targets {
    display: flex;
    gap: 8px;
  }

  .target-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 32px;
    border: 1px solid var(--outline-color);
    background: var(--bg-app);
    transition: all var(--transition-fast);
    position: relative;
    border-radius: var(--radius);
  }

  .q-label {
    font-size: 9px;
    font-weight: 900;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .shortcut-badge {
    font-size: 8px;
    font-weight: 900;
    background: var(--border-color);
    color: var(--text-muted);
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
  }

  .target-btn:hover:not(.active) {
    border-color: var(--q-color);
    background: color-mix(in srgb, var(--bg-app), var(--q-color) 15%);
  }

  .target-btn.active {
    background: var(--q-color);
    border-color: var(--q-color);
    z-index: 5;
  }

  .target-btn.active .q-label,
  .target-btn.active .shortcut-badge {
    color: #ffffff;
  }

  .target-btn.active .shortcut-badge {
    background: rgba(255,255,255,0.2);
  }

  .is-focused {
    border-color: var(--active-q-color);
  }
</style>