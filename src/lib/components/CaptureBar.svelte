<script lang="ts">
  import { Zap, Command, CornerDownLeft } from "lucide-svelte";
  import { QUADRANTS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import { fade } from "svelte/transition";
  import { onMount } from 'svelte';

  let newTaskText = $state('');
  let selectedQuadrant = $state(1);
  let inputElement: HTMLInputElement;
  let targetButtons = $state<HTMLButtonElement[]>([]);
  let isSuccessActive = $state(false);

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
      
      // Success Pulse
      isSuccessActive = true;
      setTimeout(() => isSuccessActive = false, 300);
    }
    inputElement?.focus();
  }

  function registerButton(node: HTMLButtonElement, index: number) {
    targetButtons[index] = node;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      const activeIdx = QUADRANTS.findIndex(q => q.id === selectedQuadrant);
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === inputElement) {
          e.preventDefault();
          targetButtons[2]?.focus();
        } else if (document.activeElement === targetButtons[0]) {
          e.preventDefault();
          inputElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === inputElement) {
          e.preventDefault();
          // Move to the NEXT button relative to current active mode
          // If Q1 is active, move to Q2. If Q2, move to Q3. If Q3, wrap to input (default tab) or Q1.
          // The request: "if current mode is plan then tab moves to handoff"
          const nextBtnIdx = activeIdx < 2 ? activeIdx + 1 : 0;
          targetButtons[nextBtnIdx]?.focus();
        } else if (document.activeElement === targetButtons[2]) {
          e.preventDefault();
          inputElement?.focus();
        }
      }
    } else if (e.key === 'Enter' && document.activeElement === inputElement) {
      addTask();
    }
  }
</script>

<div 
  class="capture-console industrial-hover" 
  class:success-pulse={isSuccessActive}
  style="--active-q-color: var(--color-q{selectedQuadrant}); --active-q-bg: var(--color-q{selectedQuadrant}-soft)"
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="console-inner" onclick={() => inputElement?.focus()}>
    <!-- Left Actions: Quick Toggle/Status -->
    <div class="console-left">
      <div class="status-indicator">
        <Zap 
          size={16} 
          class="charge-icon" 
          style="--charge: {Math.min(newTaskText.length / 20, 1.5)}; color: var(--active-q-color)" 
        />
      </div>
    </div>

    <!-- Input Section: Less wide, focused -->
    <div class="input-section">
      <input 
        bind:this={inputElement} 
        bind:value={newTaskText} 
        placeholder={placeholders[selectedQuadrant as keyof typeof placeholders]} 
        onkeydown={handleKeyDown}
      />
      {#if newTaskText}
        <div class="kbd-hint" transition:fade={{duration: 100}}>
          <span>ENTER</span>
          <CornerDownLeft size={10} />
        </div>
      {/if}
    </div>

    <!-- Right Actions: Quadrant Selection -->
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: var(--radius);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  }

  .success-pulse {
    border-color: var(--active-q-color) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--active-q-bg);
  }

  .console-inner {
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 0;
  }

  .console-left {
    display: flex;
    align-items: center;
    padding-right: 16px;
    border-right: 1px solid var(--border-color);
  }

  :global(.charge-icon) {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: scale(calc(1 + (var(--charge) * 0.2)));
    filter: drop-shadow(0 0 4px var(--active-q-bg));
  }

  .input-section {
    flex: 0 1 500px; /* Controlled width */
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    cursor: text;
  }

  .input-section input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    transition: font-size 0.2s cubic-bezier(0.4, 0, 0.2, 1), font-weight 0.2s;
  }

  .input-section input:focus {
    font-size: 18px;
    font-weight: 700;
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
  }

  .console-right {
    flex: 1;
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
    transition: all 0.2s;
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

  .target-btn.active:hover {
    filter: brightness(1.1);
    box-shadow: 0 0 12px var(--q-bg);
  }

  .target-btn.active .q-label,
  .target-btn.active .shortcut-badge {
    color: #ffffff;
  }

  .target-btn.active .shortcut-badge {
    background: rgba(255,255,255,0.2);
  }

  .dark .capture-console {
    background: #1a1f2b;
  }
</style>
