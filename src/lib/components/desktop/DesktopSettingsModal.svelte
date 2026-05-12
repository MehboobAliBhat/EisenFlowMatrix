<script lang="ts">
  import { X, Check, Download, Upload, Plus, Trash2, Save, LayoutGrid } from "lucide-svelte";
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

  function createNewTheme() {
    const newId = `theme-${Date.now()}`;
    const newTheme = {
      id: newId,
      name: 'New Custom Theme',
      colors: { ...themeService.activeTheme.colors },
      layout: { ...themeService.activeTheme.layout }
    };
    themeService.addTheme(newTheme);
    themeService.activeThemeId = newId;
    themeService.applyTheme();
  }

  function deleteTheme(id: string) {
    if (confirm('Delete this theme?')) {
      const defaultIds = ['industrial-classic', 'modern-soft', 'laws-of-ux', 'material-m3', 'nord-polar', 'github-primer'];
      const customOnes = themeService.themes.filter(t => t.id !== id && !defaultIds.includes(t.id));
      localStorage.setItem('eisen-custom-themes', JSON.stringify(customOnes));
      themeService.activeThemeId = 'industrial-classic';
      themeService.themes = themeService.themes.filter(t => t.id !== id);
      themeService.applyTheme();
    }
  }
</script>

{#if taskService.isSettingsOpen}
  <div class="modal-backdrop" transition:fade onclick={close}>
    <div 
      class="modal-content" 
      transition:fly={{ y: 20, duration: 300 }}
      onclick={e => e.stopPropagation()}
    >
      <header class="modal-header">
        <div class="header-title">
          <LayoutGrid size={18} />
          <h3>System Configuration</h3>
        </div>
        <button class="close-btn" onclick={close} aria-label="Close settings">
          <X size={20} />
        </button>
      </header>

      <div class="settings-body custom-scrollbar">
        <!-- Sidebar Navigation -->
        <div class="settings-sidebar">
           <section class="settings-section">
            <h4>Interface Mode</h4>
            <div class="toggle-group">
              <span class="label">Dark Mode</span>
              <button 
                class="toggle-switch" 
                class:active={taskService.darkMode}
                onclick={() => taskService.toggleTheme()}
              >
                <div class="switch-handle"></div>
              </button>
            </div>
          </section>

          <section class="settings-section">
            <div class="section-header">
              <h4>Theme Presets</h4>
              <div class="header-actions">
                <label class="action-icon-btn" title="Import Theme">
                  <Upload size={14} />
                  <input type="file" accept=".json" onchange={handleImport} hidden />
                </label>
                <button class="action-icon-btn" onclick={createNewTheme} title="Create New">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            
            <div class="theme-list">
              {#each themeService.themes as theme}
                <div class="theme-option" class:active={themeService.activeThemeId === theme.id}>
                  <button 
                    class="theme-select-btn" 
                    onclick={() => { themeService.activeThemeId = theme.id; themeService.applyTheme(); }}
                  >
                    <span class="theme-name">{theme.name}</span>
                    <div class="theme-preview">
                      <div style="background: {theme.colors.q1}"></div>
                      <div style="background: {theme.colors.q2}"></div>
                      <div style="background: {theme.colors.q3}"></div>
                      <div style="background: {theme.colors.q4}"></div>
                    </div>
                  </button>
                  <div class="theme-actions">
                    <button onclick={() => themeService.exportTheme(theme)} title="Export"><Download size={12}/></button>
                    {#if !['industrial-classic', 'modern-soft', 'laws-of-ux', 'material-m3', 'nord-polar', 'github-primer'].includes(theme.id)}
                      <button class="delete" onclick={() => deleteTheme(theme.id)}><Trash2 size={12}/></button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </section>
        </div>

        <!-- Main Editor Area -->
        <div class="settings-main">
          <section class="settings-section">
            <h4>Task Data Management</h4>
            <div class="data-actions-grid">
              <button class="data-action-btn" onclick={() => taskService.exportData()}>
                <Download size={16} />
                <span>Export Tasks (.json)</span>
              </button>
              <label class="data-action-btn">
                <Upload size={16} />
                <span>Import Tasks (.json)</span>
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

          <section class="settings-section editor">
            <div class="section-header">
              <h4>Active Theme: {themeService.activeTheme.name}</h4>
              {#if ['industrial-classic', 'modern-soft', 'laws-of-ux', 'material-m3', 'nord-polar', 'github-primer'].includes(themeService.activeTheme.id)}
                <button 
                  class="reset-btn" 
                  onclick={() => themeService.resetToDefault(themeService.activeTheme.id)}
                >
                  Reset Defaults
                </button>
              {/if}
            </div>
            
            <div class="editor-row">
              <span class="label">Display Name</span>
              <input 
                type="text" 
                bind:value={themeService.activeTheme.name} 
                oninput={() => themeService.updateTheme(themeService.activeTheme)}
              />
            </div>

            <div class="color-editor-grid">
              <div class="color-field">
                <label>Primary</label>
                <input type="color" bind:value={themeService.activeTheme.colors.primary} oninput={() => themeService.applyTheme()} />
              </div>
              <div class="color-field">
                <label>Do (Q1)</label>
                <input type="color" bind:value={themeService.activeTheme.colors.q1} oninput={() => themeService.applyTheme()} />
              </div>
              <div class="color-field">
                <label>Plan (Q2)</label>
                <input type="color" bind:value={themeService.activeTheme.colors.q2} oninput={() => themeService.applyTheme()} />
              </div>
              <div class="color-field">
                <label>Delegate (Q3)</label>
                <input type="color" bind:value={themeService.activeTheme.colors.q3} oninput={() => themeService.applyTheme()} />
              </div>
              <div class="color-field">
                <label>Archive (Q4)</label>
                <input type="color" bind:value={themeService.activeTheme.colors.q4} oninput={() => themeService.applyTheme()} />
              </div>
            </div>

            <div class="preset-selectors">
              <div class="preset-group">
                <label>Visual Roundness</label>
                <div class="segmented-control">
                  {#each [
                    { label: 'Sharp', val: 0 },
                    { label: 'Slight', val: 4 },
                    { label: 'Soft', val: 12 }
                  ] as opt}
                    <button 
                      class:active={themeService.activeTheme.layout.radius === opt.val}
                      onclick={() => { themeService.activeTheme.layout.radius = opt.val; themeService.applyTheme(); }}
                    >
                      {opt.label}
                    </button>
                  {/each}
                </div>
              </div>

              <div class="preset-group">
                <label>UI Density</label>
                <div class="segmented-control">
                  {#each [
                    { label: 'Compact', gap: 1, pad: 6, h: 32, fs: 11 },
                    { label: 'Standard', gap: 1, pad: 14, h: 46, fs: 14 },
                    { label: 'Spacious', gap: 1, pad: 24, h: 64, fs: 17 }
                  ] as opt}
                    <button 
                      class:active={themeService.activeTheme.layout.cardPadding === opt.pad}
                      onclick={() => { 
                        themeService.activeTheme.layout.gap = opt.gap; 
                        themeService.activeTheme.layout.cardPadding = opt.pad; 
                        themeService.activeTheme.layout.cardHeight = opt.h;
                        themeService.activeTheme.layout.fontSize = opt.fs;
                        themeService.applyTheme(); 
                      }}
                    >
                      {opt.label}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="primary-btn" onclick={close}>Done</button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(8px);
  }

  .modal-content {
    background: var(--bg-surface);
    width: 90vw;
    max-width: 1000px;
    height: 80vh;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  }

  .modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-sidebar);
  }

  .header-title { display: flex; align-items: center; gap: 12px; color: var(--color-primary); }
  .modal-header h3 { font-size: 13px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; }

  .settings-body {
    flex: 1;
    display: grid;
    grid-template-columns: 280px 1fr;
    overflow: hidden;
  }

  .settings-sidebar {
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .settings-main {
    padding: 32px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .settings-section h4 {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .section-header h4 { margin-bottom: 0; }

  .theme-list { display: flex; flex-direction: column; gap: 6px; }
  .theme-option {
    display: flex;
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    padding: 6px 10px;
    gap: 10px;
    align-items: center;
    border-radius: var(--radius);
  }
  .theme-option.active { border-color: var(--color-primary); background: var(--color-primary-soft); }
  .theme-select-btn { flex: 1; display: flex; align-items: center; justify-content: space-between; }
  .theme-name { font-size: 12px; font-weight: 700; }
  .theme-preview { display: flex; gap: 2px; }
  .theme-preview div { width: 10px; height: 10px; }
  .theme-actions { display: flex; gap: 6px; border-left: 1px solid var(--border-color); padding-left: 8px; color: var(--text-muted); }

  .editor { background: var(--bg-app); padding: 24px; border: 1px solid var(--border-color); }
  .editor-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .editor-row input { background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 12px; font-size: 12px; font-weight: 700; width: 240px; }

  .color-editor-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
  .color-field { display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .color-field label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); }
  .color-field input[type="color"] { width: 44px; height: 44px; border: none; background: none; cursor: pointer; padding: 0; }

  .preset-selectors { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .segmented-control { display: flex; background: var(--bg-sidebar); border: 1px solid var(--border-color); padding: 2px; gap: 2px; }
  .segmented-control button { flex: 1; padding: 8px 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); }
  .segmented-control button.active { background: var(--color-primary); color: white; }

  .toggle-group { display: flex; justify-content: space-between; align-items: center; }
  .toggle-switch { width: 36px; height: 18px; background: var(--border-color); position: relative; }
  .toggle-switch.active { background: var(--color-primary); }
  .switch-handle { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: white; transition: transform 0.2s; }
  .active .switch-handle { transform: translateX(18px); }

  .data-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .data-action-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-color); font-size: 12px; font-weight: 700; cursor: pointer; }

  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--bg-sidebar); display: flex; justify-content: flex-end; }
  .primary-btn { background: var(--color-primary); color: white; padding: 10px 32px; font-size: 12px; font-weight: 900; text-transform: uppercase; }
</style>
