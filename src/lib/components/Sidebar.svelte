<script lang="ts">
  import { Trash2, Eraser, Settings } from "lucide-svelte";
  import { SIDEBAR_LINKS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";

  let isDragOverTrash = $state(false);

  function handleTrashDrop(e: DragEvent) {
    e.preventDefault();
    isDragOverTrash = false;
    const taskId = e.dataTransfer?.getData("taskId");
    if (taskId) {
      taskService.deleteTask(taskId);
    }
  }
</script>

<aside class="sidebar">
  <button 
    class="toggle-btn" 
    onclick={() => taskService.toggleSidebar()}
    aria-label={taskService.isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={taskService.isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <path d={taskService.isSidebarCollapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"}/>
    </svg>
  </button>

  <div class="sidebar-header">
    <div class="brand">
      <h2>MatrixFlow Elite</h2>
      <p>PRECISION FOCUS</p>
    </div>
  </div>

  <nav class="sidebar-nav">
    {#each SIDEBAR_LINKS as link}
      <button 
        class="nav-item industrial-hover" 
        class:active={taskService.activeFilter === link.id}
        onclick={() => taskService.activeFilter = link.id}
        style="--item-color: var({link.var}); --item-bg-active: var({link.soft})"
        aria-label={`Filter by ${link.label}`}
      >
        <div class="nav-icon-wrapper" style="color: var({link.var})">
          <link.icon size={18} />
        </div>
        <span class="nav-label">{link.label}</span>
      </button>
    {/each}
  </nav>

  <div class="sidebar-footer">
    <div 
      class="trash-zone" 
      class:drag-over={isDragOverTrash}
      ondragover={(e) => { e.preventDefault(); isDragOverTrash = true; }}
      ondragleave={() => isDragOverTrash = false}
      ondrop={handleTrashDrop}
      role="region"
      aria-label="Trash zone"
    >
      <Trash2 size={isDragOverTrash ? 22 : 18} />
      <span class="trash-label">Trash</span>
    </div>

    <div class="footer-actions">
      <button 
        class="footer-btn industrial-hover" 
        onclick={() => taskService.clearCompleted()}
        aria-label="Clear completed tasks"
      >
        <Eraser size={16} />
        <span>Clear Done</span>
      </button>
      <button 
        class="footer-btn industrial-hover"
        aria-label="Open settings"
        onclick={() => taskService.isSettingsOpen = true}
      >
        <Settings size={16} />
        <span>Settings</span>
      </button>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: var(--sidebar-width);
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: width 0.3s ease;
    z-index: 30;
    height: 100%;
  }

  .sidebar-header { padding: 24px 20px 32px; overflow: hidden; }
  .brand h2 { font-size: 16px; font-weight: 800; white-space: nowrap; color: var(--text-primary); }
  .brand p { font-size: 9px; letter-spacing: 0.24em; font-weight: 600; color: var(--text-secondary); margin-top: 4px; }

  .sidebar-nav { flex: 1; padding: 0 8px; }
  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    margin-bottom: 4px;
    color: var(--text-secondary);
    text-align: left;
    border: 1px solid transparent;
    transition: all 0.2s;
    border-radius: var(--radius);
  }

  .nav-item.active {
    background: var(--item-bg-active) !important;
    color: var(--text-primary);
    font-weight: 700;
    border-color: var(--item-color) !important;
  }

  .nav-icon-wrapper { display: flex; align-items: center; justify-content: center; opacity: 0.8; transition: opacity 0.2s; }
  .nav-item:hover .nav-icon-wrapper, .nav-item.active .nav-icon-wrapper { opacity: 1; }

  .nav-label { font-size: 13px; font-weight: 600; transition: opacity 0.3s; white-space: nowrap; flex: 1; }
  
  .nav-count {
    font-size: 10px;
    font-weight: 800;
    padding: 2px 6px;
    background: var(--border-color);
    border-radius: 4px;
    opacity: 0.6;
  }

  :global(.sidebar-collapsed) .nav-label, 
  :global(.sidebar-collapsed) .brand,
  :global(.sidebar-collapsed) .nav-count { 
    opacity: 0; 
    pointer-events: none; 
  }

  .sidebar-footer { padding: 12px; border-top: 1px solid var(--border-color); }

  .velocity-container {
    padding: 8px 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .velocity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .velocity-label {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
  }

  .velocity-value {
    font-size: 10px;
    font-weight: 900;
    color: var(--color-primary);
  }

  .velocity-bar-bg {
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    overflow: hidden;
  }

  .velocity-bar-fill {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.sidebar-collapsed) .velocity-container {
    display: none;
  }

  .trash-zone {
    border: 2px dashed var(--border-color);
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    transition: all 0.2s;
    margin-bottom: 8px;
    border-radius: var(--radius);
  }
  .trash-zone.drag-over { background: var(--color-error-soft); color: var(--color-error); border-color: var(--color-error); transform: scale(1.02); }
  .trash-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
  :global(.sidebar-collapsed) .trash-label { display: none; }

  .footer-actions { border-top: 1px solid var(--border-color); padding-top: 4px; }
  .footer-btn { width: 100%; display: flex; align-items: center; gap: 16px; padding: 8px 16px; font-size: 13px; color: var(--text-muted); border: 1px solid transparent; transition: all 0.2s; border-radius: var(--radius); }
  .footer-btn:hover { color: var(--color-error); }
  :global(.sidebar-collapsed) .footer-btn span { display: none; }

  .toggle-btn {
    position: absolute;
    right: -12px;
    top: 32px;
    width: 24px;
    height: 24px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    z-index: 40;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .sidebar:hover .toggle-btn, :global(.sidebar-collapsed) .toggle-btn { opacity: 1; }
</style>
