<script lang="ts">
  import { X, Check, Download, Upload, Plus, Trash2, LayoutGrid } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
  import { themeService } from "$lib/theme.svelte";
  import { fly, fade } from "svelte/transition";

  function close() {
    taskService.isSettingsOpen = false;
  }

  function handleImport(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      themeService.importTheme(ev.target?.result as string);
    };
    reader.readAsText(target.files[0]);
  }
</script>

{#if taskService.isSettingsOpen}
  <div 
    class="mobile-modal-backdrop" 
    transition:fade 
    onclick={close}
    onkeydown={e => e.key === 'Escape' && close()}
    role="button"
    tabindex="-1"
    aria-label="Close settings overlay"
  >
    <div 
      class="mobile-modal-content" 
      transition:fly={{ y: '100%', duration: 400, easing: t => t * t }}
      onclick={e => e.stopPropagation()}
      onkeydown={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-settings-title"
      tabindex="-1"
    >
      <header class="modal-header">
        <div class="drag-handle" aria-hidden="true"></div>
        <div class="header-main">
          <h3 id="mobile-settings-title">Settings</h3>
          <button class="close-icon" onclick={close} aria-label="Close settings"><X size={24} /></button>
        </div>
      </header>

      <div class="settings-scroll-area">
        <section class="settings-group">
          <div class="setting-row">
            <div class="setting-info">
              <span class="title">Dark Interface</span>
              <span class="description">Switch between light and dark themes</span>
            </div>
            <button 
              class="mobile-toggle" 
              class:active={taskService.darkMode}
              onclick={() => taskService.toggleTheme()}
              aria-label={taskService.darkMode ? "Disable dark mode" : "Enable dark mode"}
              aria-pressed={taskService.darkMode}
            >
              <div class="toggle-handle"></div>
            </button>
          </div>
        </section>

        <section class="settings-group">
          <h4>DATA MANAGEMENT</h4>
          <div class="data-buttons">
            <button class="mobile-action-btn" onclick={() => taskService.exportData()}>
              <Download size={20} />
              <span>Export JSON</span>
            </button>
            <label class="mobile-action-btn">
              <Upload size={20} />
              <span>Import JSON</span>
              <input type="file" accept=".json" onchange={(e) => {
                const target = e.target as HTMLInputElement;
                if (!target.files?.length) return;
                const reader = new FileReader();
                reader.onload = (ev) => taskService.importData(ev.target?.result as string);
                reader.readAsText(target.files[0]);
                target.value = '';
              }} hidden />
            </label>
          </div>
        </section>

        <section class="settings-group">
          <h4>THEME PRESETS</h4>
          <div class="theme-scroller">
            {#each themeService.themes as theme}
              <button 
                class="mobile-theme-card" 
                class:active={themeService.activeThemeId === theme.id}
                onclick={() => { themeService.activeThemeId = theme.id; themeService.applyTheme(); }}
                aria-label={`Select ${theme.name} theme`}
              >
                <div class="preview-strip">
                  <div style="background: {theme.colors.q1}" aria-hidden="true"></div>
                  <div style="background: {theme.colors.q2}" aria-hidden="true"></div>
                  <div style="background: {theme.colors.q3}" aria-hidden="true"></div>
                  <div style="background: {theme.colors.q4}" aria-hidden="true"></div>
                </div>
                <span class="name">{theme.name}</span>
                {#if themeService.activeThemeId === theme.id}
                  <div class="check-badge"><Check size={12} /></div>
                {/if}
              </button>
            {/each}
          </div>
        </section>

        <section class="settings-group">
          <h4>VISUALS</h4>
          <div class="visual-presets">
             <div class="preset-item">
                <span class="label">Corner Radius</span>
                <div class="mobile-segmented" role="radiogroup" aria-label="Corner Radius">
                   {#each [
                    { label: 'Sharp', val: 0 },
                    { label: 'Soft', val: 12 }
                  ] as opt}
                    <button 
                      class:active={themeService.activeTheme.layout.radius === opt.val}
                      onclick={() => { themeService.activeTheme.layout.radius = opt.val; themeService.applyTheme(); }}
                      role="radio"
                      aria-checked={themeService.activeTheme.layout.radius === opt.val}
                    >
                      {opt.label}
                    </button>
                  {/each}
                </div>
             </div>
          </div>
        </section>
      </div>

      <button class="done-button" onclick={close}>SAVE & CLOSE</button>
    </div>
  </div>
{/if}

<style>
  .mobile-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
  }

  .mobile-modal-content {
    background: var(--bg-surface);
    width: 100%;
    height: 85vh;
    border-radius: 24px 24px 0 0;
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .modal-header {
    padding: 12px 16px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }

  .drag-handle {
    width: 40px;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    margin-bottom: 16px;
  }

  .header-main {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-main h3 {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .close-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .settings-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .settings-group h4 {
    font-size: 11px;
    font-weight: 900;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-bottom: 16px;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-app);
    padding: 16px;
    border-radius: 12px;
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .setting-info .title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .setting-info .description { font-size: 12px; color: var(--text-muted); }

  .mobile-toggle {
    width: 52px;
    height: 32px;
    background: var(--border-color);
    border-radius: 16px;
    position: relative;
    transition: background 0.3s;
  }
  .mobile-toggle.active { background: var(--color-primary); }
  .toggle-handle {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }
  .active .toggle-handle { transform: translateX(20px); }

  .data-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mobile-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--bg-app);
    padding: 20px;
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 700;
  }

  .theme-scroller {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin: 0 -20px;
    padding: 0 20px 8px;
  }

  .mobile-theme-card {
    min-width: 120px;
    background: var(--bg-app);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    border: 2px solid transparent;
  }

  .mobile-theme-card.active { border-color: var(--color-primary); background: var(--color-primary-soft); }

  .preview-strip { display: flex; height: 32px; border-radius: 6px; overflow: hidden; }
  .preview-strip div { flex: 1; }

  .mobile-theme-card .name { font-size: 12px; font-weight: 700; text-align: left; }
  .check-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--bg-surface);
  }

  .mobile-segmented {
    display: flex;
    background: var(--bg-app);
    padding: 4px;
    border-radius: 12px;
    gap: 4px;
  }

  .mobile-segmented button {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .mobile-segmented button.active {
    background: var(--bg-surface);
    color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .done-button {
    margin: 20px;
    height: 56px;
    background: var(--color-primary);
    color: white;
    border-radius: 16px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }
</style>
