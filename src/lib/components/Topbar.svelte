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
      <span class="compact-brand">MatrixFlow</span>
    {/if}
  </div>
  <div class="topbar-right">
    <div class="search-box">
      <Search size={12} class="search-icon" />
      <input bind:value={taskService.searchQuery} placeholder="Quick find..." />
    </div>
    
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

  .compact-brand {
    font-size: 12px;
    font-weight: 800;
    color: var(--color-primary);
    text-shadow: var(--primary-glow);
  }

  .search-box {
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    padding: 0 10px;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: var(--radius);
    transition: all var(--transition-base);
  }

  .search-box:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary-soft);
  }

  .search-icon {
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .search-box:focus-within .search-icon {
    color: var(--color-primary);
  }

  .search-box input {
    background: transparent;
    border: none;
    outline: none;
    font-size: 11px;
    width: 140px;
    color: var(--text-primary);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .data-actions {
    display: flex;
    border-left: 1px solid var(--border-color);
    margin-left: 6px;
    padding-left: 6px;
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
    border: 1px solid var(--outline-color);
    color: var(--text-secondary);
    transition: all 0.2s;
    border-radius: var(--radius);
  }

  .icon-btn-like:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }
</style>
