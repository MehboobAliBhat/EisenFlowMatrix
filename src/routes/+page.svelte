<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { 
    Zap, 
    Calendar, 
    Repeat, 
    Trash2, 
    Moon, 
    Sun,
    Settings, 
    Archive, 
    ClipboardList, 
    Search, 
    Plus,
    Check,
    Download,
    Eraser,
    Trash
  } from "lucide-svelte";

  // Task Schema
  interface Task {
    id: string;
    text: string;
    quadrant: number;
    completed: boolean;
    timestamp: number;
  }

  // State
  let tasks = $state<Task[]>([]);
  let newTaskText = $state('');
  let darkMode = $state(false);
  let searchQuery = $state('');
  let activeFilter = $state('all');
  let selectedQuadrant = $state(1);
  let isSidebarCollapsed = $state(false);
  
  let inputElement: HTMLInputElement;

  // Persistence
  onMount(() => {
    const savedTasks = localStorage.getItem('eisen-tasks');
    if (savedTasks) {
      try { tasks = JSON.parse(savedTasks); } catch (e) {}
    }
    
    const savedTheme = localStorage.getItem('eisen-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      darkMode = true;
    }

    const savedSidebar = localStorage.getItem('eisen-sidebar-collapsed');
    isSidebarCollapsed = savedSidebar === 'true';
  });

  $effect(() => {
    localStorage.setItem('eisen-tasks', JSON.stringify(tasks));
  });

  $effect(() => {
    localStorage.setItem('eisen-sidebar-collapsed', isSidebarCollapsed.toString());
    if (isSidebarCollapsed) document.documentElement.classList.add('sidebar-collapsed');
    else document.documentElement.classList.remove('sidebar-collapsed');
  });

  $effect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('eisen-theme', darkMode ? 'dark' : 'light');
  });

  // Actions
  async function addTask(explicitQuadrant?: number) {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      quadrant: explicitQuadrant ?? selectedQuadrant,
      completed: false,
      timestamp: Date.now()
    };
    tasks = [newTask, ...tasks];
    newTaskText = '';
    await tick();
    inputElement?.focus();
  }

  function deleteTask(id: string) { tasks = tasks.filter(t => t.id !== id); }
  function toggleTask(id: string) { tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); }
  function moveTask(id: string, q: number) { tasks = tasks.map(t => t.id === id ? { ...t, quadrant: q } : t); }
  function clearCompleted() { tasks = tasks.filter(t => !t.completed); }
  function purgeVoid() { tasks = tasks.filter(t => t.quadrant !== 4); }

  function downloadData() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eisenhower-tasks.json';
    a.click();
  }

  function handleImport(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          const ids = new Set(tasks.map(t => t.id));
          tasks = [...imported.filter(t => !ids.has(t.id)), ...tasks];
        }
      } catch (err) {}
    };
    reader.readAsText(target.files[0]);
    target.value = '';
  }

  // Drag and Drop
  let draggedTaskId = $state<string | null>(null);
  let dragOverQuadrantId = $state<number | null>(null);
  let dragOverTrash = $state(false);

  function handleDragStart(id: string) { draggedTaskId = id; }
  function handleDragOver(qId: number) { dragOverQuadrantId = qId; dragOverTrash = false; }
  function handleDragOverTrash() { dragOverTrash = true; dragOverQuadrantId = null; }
  function handleDragLeave() { dragOverQuadrantId = null; dragOverTrash = false; }
  function handleDrop(q: number) { if (draggedTaskId) { moveTask(draggedTaskId, q); draggedTaskId = null; dragOverQuadrantId = null; } }
  function handleTrashDrop() { if (draggedTaskId) { deleteTask(draggedTaskId); draggedTaskId = null; dragOverTrash = false; } }

  const filteredTasks = $derived(() => {
    let res = tasks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(t => t.text.toLowerCase().includes(q));
    }
    return res;
  });

  const quadrants = [
    { id: 1, label: 'DO', title: 'DO', sub: 'URGENT & IMPORTANT', icon: Zap, var: '--color-q1', soft: '--color-q1-soft' },
    { id: 2, label: 'PLAN', title: 'PLAN', sub: 'IMPORTANT & NOT URGENT', icon: Calendar, var: '--color-q2', soft: '--color-q2-soft' },
    { id: 3, label: 'HANDOFF', title: 'HANDOFF', sub: 'URGENT & NOT IMPORTANT', icon: Repeat, var: '--color-q3', soft: '--color-q3-soft' },
    { id: 4, label: 'VOID', title: 'VOID', sub: 'NEITHER URGENT NOR IMPORTANT', icon: Archive, var: '--color-q4', soft: '--color-q4-soft' }
  ];

  const sidebarLinks = [
    { id: 'all', label: 'All Tasks', icon: ClipboardList, var: '--color-q1', soft: '--color-q1-soft' },
    { id: '1', label: 'Do', icon: Zap, var: '--color-q1', soft: '--color-q1-soft' },
    { id: '2', label: 'Plan', icon: Calendar, var: '--color-q2', soft: '--color-q2-soft' },
    { id: '3', label: 'Handoff', icon: Repeat, var: '--color-q3', soft: '--color-q3-soft' },
    { id: '4', label: 'Void', icon: Archive, var: '--color-q4', soft: '--color-q4-soft' }
  ];

  function getTasks(id: number) { return filteredTasks().filter(t => t.quadrant === id).sort((a,b) => b.timestamp - a.timestamp); }
</script>

<div class="app-container">
  <aside class="sidebar" class:collapsed={isSidebarCollapsed}>
    <button class="toggle-btn" onclick={() => isSidebarCollapsed = !isSidebarCollapsed}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d={isSidebarCollapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"}/>
      </svg>
    </button>

    <div class="sidebar-header">
      <div class="brand">
        <h2>MatrixFlow Elite</h2>
        <p>PRECISION FOCUS</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      {#each sidebarLinks as link}
        <button 
          class="nav-item industrial-hover" 
          class:active={activeFilter === link.id}
          onclick={() => activeFilter = link.id}
          style="--item-color: var({link.var}); --item-bg-active: var({link.soft})"
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
        class:drag-over={dragOverTrash}
        ondragover={(e) => { e.preventDefault(); handleDragOverTrash(); }}
        ondragleave={handleDragLeave}
        ondrop={handleTrashDrop}
      >
        <Trash2 size={dragOverTrash ? 22 : 18} />
        <span class="trash-label">Trash</span>
      </div>

      <div class="footer-actions">
        <button class="footer-btn industrial-hover" onclick={clearCompleted}>
          <Eraser size={16} />
          <span>Clear Done</span>
        </button>
        <button class="footer-btn industrial-hover">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  </aside>

  <main class="main-content">
    <header class="topbar">
      <div class="topbar-left">
        {#if isSidebarCollapsed}<span class="compact-brand">MatrixFlow</span>{/if}
      </div>
      <div class="topbar-right">
        <div class="search-box industrial-hover">
          <Search size={12} />
          <input bind:value={searchQuery} placeholder="Quick find..." />
        </div>
        <button class="icon-btn industrial-hover" onclick={() => darkMode = !darkMode}>
          {#if darkMode}<Sun size={14}/>{:else}<Moon size={14}/>{/if}
        </button>
        <div class="data-actions">
          <label class="icon-btn industrial-hover" title="Import">
            <input type="file" accept=".json" onchange={handleImport} hidden />
            <Download size={14} style="transform: rotate(180deg)" />
          </label>
          <button class="icon-btn industrial-hover" onclick={downloadData} title="Export">
            <Download size={14} />
          </button>
        </div>
      </div>
    </header>

    <div class="content-area">
      <div class="capture-bar industrial-hover">
        <div class="capture-inner">
          <Zap size={14} style="color: var(--color-q{selectedQuadrant})" />
          <input 
            bind:this={inputElement} 
            bind:value={newTaskText} 
            placeholder="Capture a new task..." 
            onkeydown={e => e.key === 'Enter' && addTask()}
          />
          <div class="capture-targets">
            {#each quadrants.slice(0,3) as q}
              <button 
                class="target-btn industrial-hover" 
                class:active={selectedQuadrant === q.id}
                onclick={() => addTask(q.id)}
              >{q.label}</button>
            {/each}
          </div>
        </div>
        <div class="capture-accent" style="background: var(--color-q{selectedQuadrant})"></div>
      </div>

      <div class="matrix-grid">
        {#each quadrants as q}
          {#if activeFilter === 'all' || activeFilter === q.id.toString()}
            <section 
              class="quadrant" 
              style="--q-color: var({q.var}); --q-soft: var({q.soft}); --q-header: var({q.var}-header)"
              class:dim={q.id === 4}
              class:drag-over={dragOverQuadrantId === q.id}
              ondragover={(e) => { e.preventDefault(); handleDragOver(q.id); }}
              ondragleave={handleDragLeave}
              ondrop={() => handleDrop(q.id)}
            >
              <header class="quadrant-header" style="background: var(--q-header); margin: -12px -12px 12px; padding: 10px 12px;">
                <div class="q-title" style="color: var(--q-color)">
                  <q.icon size={16} stroke-width={3} />
                  <h3>{q.title}</h3>
                </div>
                <div class="q-meta" style="color: var(--q-color)">
                  {#if q.id === 4 && getTasks(4).length > 0}
                    <button class="purge-btn industrial-hover" onclick={purgeVoid} style="background: var(--color-q4); color: #ffffff">Purge</button>
                  {/if}
                  <span style="opacity: 0.8">{q.sub}</span>
                </div>
              </header>

              <div class="task-list custom-scrollbar">
                {#each getTasks(q.id) as task (task.id)}
                  <div 
                    class="task-card industrial-hover" 
                    draggable="true" 
                    ondragstart={() => handleDragStart(task.id)}
                  >
                    <div class="task-left">
                      <label class="checkbox-container">
                        <input type="checkbox" checked={task.completed} onchange={() => toggleTask(task.id)} />
                        <div class="checkmark"><Check size={8} stroke-width={4} /></div>
                      </label>
                      <span class="task-text" class:completed={task.completed}>{task.text}</span>
                    </div>
                    <div class="task-actions">
                      {#each quadrants.slice(0,3) as target}
                        {#if target.id !== q.id}
                          <button class="action-btn industrial-hover-subtle" onclick={() => moveTask(task.id, target.id)} title={target.label}>
                            <target.icon size={11} />
                          </button>
                        {/if}
                      {/each}
                      <button class="action-btn delete industrial-hover-subtle" onclick={() => deleteTask(task.id)}><Trash2 size={12}/></button>
                    </div>
                  </div>
                {/each}
                {#if getTasks(q.id).length === 0}
                  <div class="empty-state">NO ITEMS</div>
                {/if}
              </div>
            </section>
          {/if}
        {/each}
      </div>
    </div>
  </main>
</div>

<style>
  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: var(--bg-app);
  }

  /* Universal Industrial Hover Behavior (Zero Shadow, Static, Stable Outline) */
  .industrial-hover {
    transition: background-color 0.2s, outline-color 0.2s !important;
    outline: 1px solid transparent;
  }
  .industrial-hover:hover {
    outline-color: currentColor !important;
    background-color: var(--bg-surface) !important;
    z-index: 10;
  }
  .dark .industrial-hover:hover {
    background-color: rgba(255, 255, 255, 0.08) !important;
  }

  /* Specific Stable Colored Outlines */
  .nav-item.industrial-hover:hover {
    outline-color: var(--item-color) !important;
  }
  
  .target-btn.industrial-hover:hover {
    outline-color: var(--item-color) !important;
  }

  .purge-btn.industrial-hover:hover {
    outline-color: var(--color-error) !important;
  }

  .industrial-hover-subtle {
    transition: color 0.2s !important;
  }
  .industrial-hover-subtle:hover {
    color: var(--color-primary) !important;
  }
  .industrial-hover-subtle.delete:hover {
    color: var(--color-error) !important;
  }

  .add-task-btn:hover { opacity: 1; }

  /* Sidebar */
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
  }

  .nav-item.active {
    background: var(--item-bg-active) !important;
    color: var(--text-primary);
    font-weight: 700;
    border-color: var(--item-color) !important;
    transform: none !important;
  }

  .nav-icon-wrapper { display: flex; align-items: center; justify-content: center; opacity: 0.8; transition: opacity 0.2s; }
  .nav-item:hover .nav-icon-wrapper, .nav-item.active .nav-icon-wrapper { opacity: 1; }

  .nav-label { font-size: 13px; font-weight: 600; transition: opacity 0.3s; }
  .collapsed .nav-label, .collapsed .brand { opacity: 0; pointer-events: none; }

  .sidebar-footer { padding: 12px; border-top: 1px solid var(--border-color); }
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
  }
  .trash-zone.drag-over { background: var(--color-error-soft); color: var(--color-error); border-color: var(--color-error); transform: scale(1.02); }
  .trash-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
  .collapsed .trash-label { display: none; }

  .footer-actions { border-top: 1px solid var(--border-color); padding-top: 4px; }
  .footer-btn { width: 100%; display: flex; align-items: center; gap: 16px; padding: 8px 16px; font-size: 13px; color: var(--text-muted); border: 1px solid transparent; }
  .footer-btn:hover { color: var(--color-error); }
  .collapsed .footer-btn span { display: none; }

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
  .sidebar:hover .toggle-btn, .collapsed .toggle-btn { opacity: 1; }

  /* Main Content */
  .main-content { flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
  .topbar { height: var(--header-height); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }
  .compact-brand { font-size: 12px; font-weight: 800; color: var(--text-primary); }

  .search-box { background: var(--bg-surface); border: 1px solid var(--outline-color); padding: 0 10px; height: 32px; display: flex; align-items: center; gap: 8px; }
  .search-box input { background: transparent; border: none; outline: none; font-size: 11px; width: 140px; color: var(--text-primary); }

  .topbar-right { display: flex; align-items: center; gap: 6px; }
  .icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border: 1px solid var(--outline-color); color: var(--text-secondary); }
  .icon-btn:hover { color: var(--color-primary); border-color: var(--color-primary); }

  .data-actions { display: flex; border-left: 1px solid var(--outline-color); margin-left: 6px; }

  /* Content */
  .content-area { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
  .capture-bar { background: var(--bg-surface); border: 1px solid var(--outline-color); position: relative; flex-shrink: 0; }
  .capture-inner { height: var(--capture-height); display: flex; align-items: center; padding: 0 16px; gap: 12px; }
  .capture-inner input { flex: 1; background: transparent; border: none; outline: none; font-size: 14px; font-weight: 500; color: var(--text-primary); }
  .capture-accent { height: 2px; transition: background 0.3s; }

  .capture-targets { display: flex; gap: 4px; }
  .target-btn { padding: 0 10px; height: 30px; border: 1px solid var(--outline-color); font-size: 9px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
  .target-btn.active { background: var(--bg-app); border-color: transparent; font-weight: 800; }

  /* Matrix */
  .matrix-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; min-height: 0; }
  .quadrant { background: var(--q-soft); padding: 12px; display: flex; flex-direction: column; min-height: 0; transition: all 0.3s; border: 1px solid transparent; }
  .quadrant.dim { opacity: 0.5; filter: grayscale(1); }
  .quadrant.drag-over { border: 2px solid var(--q-color); }

  .quadrant-header { display: flex; justify-content: space-between; margin-bottom: 8px; flex-shrink: 0; }
  .q-title { display: flex; align-items: center; gap: 8px; color: var(--q-color); }
  .q-title h3 { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; }
  .q-meta { display: flex; align-items: center; gap: 6px; color: var(--q-color); opacity: 0.4; }
  .q-meta span { font-size: 7px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; }

  .purge-btn { font-size: 7px; font-weight: 900; background: var(--color-error); color: white; padding: 2px 6px; border: 1px solid transparent; }

  /* Tasks */
  .task-list { flex: 1; overflow-y: auto; padding-right: 4px; }
  .task-card { height: var(--card-height); background: var(--bg-surface); border: 1px solid var(--outline-color); display: flex; align-items: center; justify-content: space-between; padding: 0 10px; margin-bottom: 4px; cursor: grab; }
  .task-left { display: flex; align-items: center; gap: 8px; }
  .task-text { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .task-text.completed { text-decoration: line-through; opacity: 0.4; }

  .task-actions { display: flex; gap: 2px; opacity: 0; transition: opacity 0.2s; }
  .task-card:hover .task-actions { opacity: 1; }
  .action-btn { padding: 4px; color: var(--text-muted); border: 1px solid transparent; background: transparent !important; }

  .checkbox-container { position: relative; width: 14px; height: 14px; cursor: pointer; }
  .checkbox-container input { display: none; }
  .checkmark { position: absolute; inset: 0; border: 2px solid var(--q-color); display: flex; align-items: center; justify-content: center; color: white; }
  .checkbox-container input:checked + .checkmark { background: var(--q-color); }

  .empty-state { height: 36px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--outline-color); font-size: 7px; font-weight: 800; letter-spacing: 0.2em; opacity: 0.3; }

  /* Scrollbar */
  .custom-scrollbar::-webkit-scrollbar { width: 3px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); }
</style>
