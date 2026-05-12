<script lang="ts">
  import { Search, Sun, Moon, Download } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
  import IconBtn from "./IconBtn.svelte";

  let isSearchExpanded = $state(false);
  let searchInput = $state<HTMLInputElement>();

  function toggleSearch() {
    isSearchExpanded = !isSearchExpanded;
    if (isSearchExpanded) {
      setTimeout(() => searchInput?.focus(), 50);
    }
  }

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
    <div class="brand-container">
      <span class="brand-text">MatrixFlow</span>
      <div class="brand-dot"></div>
    </div>
  </div>

  <div class="topbar-right">
    <div class="search-wrapper" class:mobile-expanded={isSearchExpanded}>
      <div class="search-box">
        <button 
          class="search-trigger" 
          onclick={toggleSearch}
          aria-label="Search tasks"
        >
          <Search size={14} />
        </button>
        <input 
          bind:this={searchInput}
          class="search-input"
          bind:value={taskService.searchQuery} 
          placeholder="COMMAND / FIND..." 
          spellcheck="false"
          onblur={() => { if (!taskService.searchQuery) isSearchExpanded = false; }}
        />
        <div class="desktop-only-kbd">F</div>
      </div>
    </div>
    
    <div class="actions-group">
      <div class="desktop-only-flex">
        <div class="action-divider"></div>
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

      <IconBtn onclick={() => taskService.toggleTheme()} title="Toggle Theme">
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

  /* Branding */
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

  /* Search & Actions Area */
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    justify-content: flex-end;
  }

  .search-wrapper {
    position: relative;
    /* Doherty Threshold: Keep transitions fast and purposeful */
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .search-box {
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    height: 32px;
    width: 200px;
    display: flex;
    align-items: center;
    border-radius: var(--radius);
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s;
    overflow: hidden;
  }

  .search-trigger {
    width: 32px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-right: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-muted);
    cursor: pointer;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-primary);
    width: 100%;
  }

  .desktop-only-kbd {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    border-radius: 2px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .actions-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .desktop-only-flex {
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

  /* Mobile Overrides */
  @media (max-width: 768px) {
    .topbar {
      padding: 0 12px;
    }

    .desktop-only-flex, .desktop-only-kbd {
      display: none;
    }

    .search-wrapper {
      position: absolute;
      right: 56px; 
      top: 50%;
      transform: translateY(-50%);
      transition: none; /* No movement on mobile when collapsed */
    }

    .search-box {
      width: 32px;
      background: transparent;
      border-color: transparent;
      transition: none;
    }

    .search-trigger {
      border: 1px solid var(--border-color);
      border-radius: 50%;
      transition: all 0.15s ease;
    }

    .search-input {
      display: none;
    }

    /* Expanded State - Pure overlay for zero distraction */
    .search-wrapper.mobile-expanded {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: var(--bg-sidebar);
      padding: 0 12px;
      display: flex;
      align-items: center;
      z-index: 110;
      transform: none;
      animation: fade-in 0.15s ease-out;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .search-wrapper.mobile-expanded .search-box {
      width: 100%;
      background: var(--bg-app);
      border-color: var(--color-primary);
      border-radius: var(--radius);
      display: flex;
    }

    .search-wrapper.mobile-expanded .search-input {
      display: block;
    }

    .search-wrapper.mobile-expanded .search-trigger {
      border-radius: 0;
      border: none;
      border-right: 1px solid var(--border-color);
      background: var(--color-primary-soft);
      color: var(--color-primary);
    }
  }

  /* Desktop Focus States */
  @media (min-width: 769px) {
    .search-box:focus-within {
      width: 280px;
      border-color: var(--color-primary);
    }
  }
</style>