<script lang="ts">
  import { Search, Sun, Moon, Download } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
  import IconBtn from "./IconBtn.svelte";

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
</script>

<header class="topbar">
  <div class="topbar-accent"></div>
  
  <div class="topbar-left">
    {#if taskService.isSidebarCollapsed}
      <div class="compact-brand-box">
        <span class="compact-brand">MatrixFlow</span>
        <div class="brand-status-dot"></div>
      </div>
    {/if}
  </div>

  <div class="topbar-right">
    <div class="search-container">
      <div class="search-box">
        <div class="search-indicator">
          <Search size={12} class="search-icon" />
        </div>
        <input 
          class="top-search-input"
          bind:value={taskService.searchQuery} 
          placeholder="COMMAND / FIND..." 
          spellcheck="false"
        />
        <div class="search-kbd">F</div>
      </div>
    </div>
    
    <div class="action-divider"></div>
    
    <IconBtn onclick={() => taskService.toggleTheme()} title="Toggle Theme">
      {#if taskService.darkMode}<Sun size={14}/>{:else}<Moon size={14}/>{/if}
    </IconBtn>
    
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
    flex-shrink: 0;
    background: var(--bg-sidebar);
    position: relative;
    z-index: 50;
  }

  @media (max-width: 640px) {
    .topbar { padding: 0 12px; }
    .data-actions { display: none; }
    .search-box { width: 140px; }
    .search-kbd { display: none; }
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

  .compact-brand-box {
    display: flex;
    align-items: center; gap: 8px;
  }

  .compact-brand {
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-primary);
    text-shadow: var(--primary-glow);
  }

  .brand-status-dot {
    width: 4px;
    height: 4px;
    background: var(--color-primary);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--color-primary);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Enhanced Search Bar */
  .search-container {
    position: relative;
  }

  .search-box {
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    height: 32px;
    width: 240px;
    display: flex;
    align-items: center;
    border-radius: var(--radius);
    transition: all var(--transition-base);
    overflow: hidden;
  }

  .search-indicator {
    width: 32px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }

  .search-box input::placeholder {
    color: var(--text-muted);
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .search-kbd {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    border-radius: 2px;
    opacity: 0.6;
  }

  .search-box:focus-within {
    border-color: var(--color-primary);
    width: 280px;
    background: var(--bg-surface);
  }

  .search-box:focus-within .search-indicator {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
    color: var(--color-primary);
  }

  .search-box:focus-within .search-kbd {
    color: var(--color-primary);
    border-color: var(--color-primary);
    opacity: 1;
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

  .icon-wrapper {
    cursor: pointer;
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
    transition: all var(--transition-base);
    border-radius: var(--radius);
    position: relative;
    overflow: hidden;
  }

  .icon-btn-like:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .icon-btn-like:hover :global(svg) {
    transform: scale(1.1);
  }

  .icon-btn-like :global(svg) {
    transition: transform var(--transition-fast);
  }
</style>