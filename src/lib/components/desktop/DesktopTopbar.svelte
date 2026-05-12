<script lang="ts">
  import { Search, Sun, Moon, Download, X } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
  import IconBtn from "../IconBtn.svelte";

  let searchInput = $state<HTMLInputElement>();

  function handleImport(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      taskService.importData(ev.target?.result as string);
    };
    reader.readAsText(target.files[0]);
    target.value = '';
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      taskService.searchQuery = '';
      searchInput?.blur();
    }
  }

  function clearSearch() {
    taskService.searchQuery = '';
    searchInput?.focus();
  }
</script>

<header class="topbar">
  <div class="topbar-accent"></div>
  
  <div class="topbar-left">
    <div class="brand-container">
      <span class="brand-text">MatrixFlow</span>
      <div class="brand-dot"></div>
    </div>
  </div>

  <div class="topbar-right">
    <div class="search-wrapper">
      <div class="search-box">
        <div class="search-icon">
          <Search size={14} />
        </div>
        <input 
          bind:this={searchInput}
          class="search-input"
          bind:value={taskService.searchQuery} 
          placeholder="COMMAND / FIND..." 
          spellcheck="false"
          onkeydown={handleSearchKeyDown}
        />
        
        {#if taskService.searchQuery}
          <button class="clear-search-btn" onclick={clearSearch} aria-label="Clear search">
            <X size={12} />
          </button>
        {:else}
          <div class="kbd-hint">F</div>
        {/if}
      </div>
    </div>
    
    <div class="actions-group">
      <div class="data-actions">
        <label class="icon-wrapper" title="Import Data">
          <input type="file" accept=".json" onchange={handleImport} hidden />
          <div class="icon-btn-like">
            <Download size={14} style="transform: rotate(180deg)" />
          </div>
        </label>
        <IconBtn onclick={() => taskService.exportData()} title="Export Data">
          <Download size={14} />
        </IconBtn>
      </div>

      <div class="action-divider"></div>

      <IconBtn onclick={() => taskService.toggleTheme()} title="Toggle Theme (Alt+T)">
        {#if taskService.darkMode}<Sun size={14}/>{:else}<Moon size={14}/>{/if}
      </IconBtn>
    </div>
  </div>
</header>

<style>
  .topbar {
    height: var(--header-height);
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-sidebar);
    position: relative;
    z-index: 100;
  }

  .topbar-accent {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--color-primary);
    opacity: 0.8;
  }

  .brand-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand-text {
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-primary);
    text-shadow: var(--primary-glow);
  }

  .brand-dot {
    width: 4px;
    height: 4px;
    background: var(--color-primary);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--color-primary);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    justify-content: flex-end;
  }

  .search-box {
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    height: 32px;
    width: 200px;
    display: flex;
    align-items: center;
    border-radius: var(--radius);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .search-box:focus-within {
    width: 280px;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary-soft);
  }

  .search-icon {
    width: 36px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    border-right: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-primary);
    min-width: 0;
  }

  .kbd-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    border-radius: 2px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .clear-search-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    margin-right: 4px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .clear-search-btn:hover {
    background: var(--color-error-soft);
    color: var(--color-error);
  }

  .actions-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .action-divider {
    width: 1px;
    height: 16px;
    background: var(--border-color);
  }

  .data-actions {
    display: flex;
    gap: 6px;
  }

  .icon-btn-like {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .icon-btn-like:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
</style>
