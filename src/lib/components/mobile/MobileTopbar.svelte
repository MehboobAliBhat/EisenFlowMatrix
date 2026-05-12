<script lang="ts">
  import { Search, Sun, Moon, ArrowLeft } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
  import IconBtn from "../IconBtn.svelte";

  let isSearchActive = $state(false);
  let searchInput = $state<HTMLInputElement>();

  function toggleSearch() {
    isSearchActive = !isSearchActive;
    if (isSearchActive) {
      setTimeout(() => searchInput?.focus(), 50);
    } else {
      taskService.searchQuery = '';
    }
  }
</script>

<header class="topbar">
  {#if isSearchActive}
    <div class="search-overlay">
      <button class="back-btn" onclick={toggleSearch}>
        <ArrowLeft size={20} />
      </button>
      <input 
        bind:this={searchInput}
        class="mobile-search-input"
        bind:value={taskService.searchQuery} 
        placeholder="SEARCH TASKS..." 
        spellcheck="false"
      />
      {#if taskService.searchQuery}
        <button class="clear-btn" onclick={() => taskService.searchQuery = ''}>CLEAR</button>
      {/if}
    </div>
  {:else}
    <div class="topbar-content">
      <div class="brand">
        <span class="brand-text">MATRIX</span>
        <div class="brand-dot"></div>
      </div>

      <div class="actions">
        <button class="action-trigger" onclick={toggleSearch} aria-label="Open Search">
          <Search size={20} />
        </button>
        <button class="action-trigger" onclick={() => taskService.toggleTheme()} aria-label="Toggle Theme">
          {#if taskService.darkMode}<Sun size={20}/>{:else}<Moon size={20}/>{/if}
        </button>
      </div>
    </div>
  {/if}
</header>

<style>
  .topbar {
    height: var(--header-height);
    background: var(--bg-sidebar);
    border-bottom: 1px solid var(--border-color);
    padding: 0 16px;
    position: relative;
    z-index: 1000;
  }

  .topbar-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand-text {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: var(--color-primary);
  }

  .brand-dot {
    width: 6px;
    height: 6px;
    background: var(--color-primary);
    border-radius: 50%;
  }

  .actions {
    display: flex;
    gap: 4px;
  }

  .action-trigger {
    width: 44px; /* Fitts's Law */
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  /* Search Overlay - Laws of UX: Focused interaction */
  .search-overlay {
    position: absolute;
    inset: 0;
    background: var(--bg-surface);
    display: flex;
    align-items: center;
    padding: 0 8px;
    animation: fade-in 0.15s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .back-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
  }

  .mobile-search-input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 16px; /* Prevent iOS zoom */
    font-weight: 600;
    color: var(--text-primary);
    padding: 0 8px;
  }

  .clear-btn {
    font-size: 10px;
    font-weight: 900;
    color: var(--color-error);
    padding: 8px;
  }
</style>
