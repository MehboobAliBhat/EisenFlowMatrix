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
    { id: 1, label: 'DO', title: 'DO', sub: 'URGENT & IMPORTANT', icon: Zap, var: '--color-q1' },
    { id: 2, label: 'PLAN', title: 'PLAN', sub: 'IMPORTANT & NOT URGENT', icon: Calendar, var: '--color-q2' },
    { id: 3, label: 'HANDOFF', title: 'HANDOFF', sub: 'URGENT & NOT IMPORTANT', icon: Repeat, var: '--color-q3' },
    { id: 4, label: 'VOID', title: 'VOID', sub: 'NEITHER URGENT NOR IMPORTANT', icon: Archive, var: '--color-q4' }
  ];

  const sidebarLinks = [
    { id: 'all', label: 'All Tasks', icon: ClipboardList, var: '--color-q1' },
    { id: '1', label: 'Do', icon: Zap, var: '--color-q1' },
    { id: '2', label: 'Plan', icon: Calendar, var: '--color-q2' },
    { id: '3', label: 'Handoff', icon: Repeat, var: '--color-q3' },
    { id: '4', label: 'Void', icon: Archive, var: '--color-q4' }
  ];

  function getTasks(id: number) { return filteredTasks().filter(t => t.quadrant === id).sort((a,b) => b.timestamp - a.timestamp); }
</script>

<div class="app-container">
  <aside class="sidebar" class:collapsed={isSidebarCollapsed}>
    <button class="toggle-btn" onclick={() => isSidebarCollapsed = !isSidebarCollapsed}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          class="nav-item" 
          class:active={activeFilter === link.id}
          onclick={() => activeFilter = link.id}
          style="--item-color: var({link.var})"
        >
          <link.icon size={18} class="nav-icon" />
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
        <button class="footer-btn" onclick={clearCompleted}>
          <Eraser size={16} />
          <span>Clear Done</span>
        </button>
        <button class="footer-btn">
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
        <div class="search-box">
          <Search size={12} />
          <input bind:value={searchQuery} placeholder="Search tasks..." />
        </div>
        <button class="icon-btn" onclick={() => darkMode = !darkMode}>
          {#if darkMode}<Sun size={14}/>{:else}<Moon size={14}/>{/if}
        </button>
        <div class="data-actions">
          <label class="icon-btn" title="Import">
            <input type="file" accept=".json" onchange={handleImport} hidden />
            <Download size={14} style="transform: rotate(180deg)" />
          </label>
          <button class="icon-btn" onclick={downloadData} title="Export">
            <Download size={14} />
          </button>
        </div>
      </div>
    </header>

    <div class="content-area">
      <div class="capture-bar">
        <div class="capture-inner">
          <Zap size={14} style="color: var(--color-q{selectedQuadrant})" />
          <input 
            bind:this={inputElement} 
            bind:value={newTaskText} 
            placeholder="Quick capture..." 
            onkeydown={e => e.key === 'Enter' && addTask()}
          />
          <div class="capture-targets">
            {#each quadrants.slice(0,3) as q}
              <button 
                class="target-btn" 
                class:active={selectedQuadrant === q.id}
                onclick={() => selectedQuadrant = q.id}
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
              style="--q-color: var({q.var})"
              class:dim={q.id === 4}
              class:drag-over={dragOverQuadrantId === q.id}
              ondragover={(e) => { e.preventDefault(); handleDragOver(q.id); }}
              ondragleave={handleDragLeave}
              ondrop={() => handleDrop(q.id)}
            >
              <header class="quadrant-header">
                <div class="q-title">
                  <q.icon size={16} stroke-width={3} />
                  <h3>{q.title}</h3>
                </div>
                <div class="q-meta">
                  {#if q.id === 4 && getTasks(4).length > 0}
                    <button class="purge-btn" onclick={purgeVoid}>Purge</button>
                  {/if}
                  <span>{q.sub}</span>
                </div>
              </header>

              <div class="task-list custom-scrollbar">
                {#each getTasks(q.id) as task (task.id)}
                  <div 
                    class="task-card" 
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
                          <button class="action-btn" onclick={() => moveTask(task.id, target.id)} title={target.label}>
                            <target.icon size={11} />
                          </button>
                        {/if}
                      {/each}
                      <button class="action-btn delete" onclick={() => deleteTask(task.id)}><Trash2 size={12}/></button>
                    </div>
                  </div>
                {/each}
                {#if getTasks(q.id).length === 0}
                  <div class="empty-state">NO ITEMS</div>
                {/if}
              </div>

              <button class="add-task-btn" onclick={() => { selectedQuadrant = q.id; inputElement.focus(); }}>
                <Plus size={11} stroke-width={3} />
                <span>Add new task</span>
              </button>
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
  }

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
  }

  .sidebar-header {
    padding: 32px 24px 40px;
    overflow: hidden;
  }

  .brand h2 { font-size: 16px; font-weight: 800; white-space: nowrap; }
  .brand p { font-size: 9px; letter-spacing: 0.24em; font-weight: 600; color: var(--text-secondary); margin-top: 4px; }

  .sidebar-nav { flex: 1; padding: 0 8px; }
  
  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    margin-bottom: 4px;
    transition: background 0.2s, color 0.2s;
    color: var(--text-secondary);
    text-align: left;
  }

  .nav-item.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 700;
  }

  .nav-item:hover {
    background: rgba(0, 0, 0, 0.03);
    color: var(--item-color);
  }
  .dark .nav-item:hover { background: rgba(255, 255, 255, 0.03); }

  .nav-icon { color: var(--item-color); opacity: 0.7; }
  .nav-item:hover .nav-icon, .nav-item.active .nav-icon { opacity: 1; }

  .nav-label { font-size: 14px; font-medium: 500; transition: opacity 0.3s; }
  .collapsed .nav-label, .collapsed .brand { opacity: 0; pointer-events: none; }

  .sidebar-footer { padding: 12px; border-top: 1px solid var(--border-color); }
  
  .trash-zone {
    border: 2px dashed var(--border-color);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    transition: all 0.2s;
    margin-bottom: 12px;
  }

  .trash-zone.drag-over {
    background: var(--color-error-soft);
    color: var(--color-error);
    border-color: var(--color-error);
    transform: scale(1.02);
  }

  .trash-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
  .collapsed .trash-label { display: none; }
  .collapsed .trash-zone { padding: 16px 8px; }

  .footer-actions { border-top: 1px solid var(--border-color); padding-top: 8px; }
  .footer-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--text-muted);
    transition: color 0.2s, background 0.2s;
  }
  .footer-btn:hover { color: var(--color-error); background: rgba(0,0,0,0.02); }
  .collapsed .footer-btn span { display: none; }

  .toggle-btn {
    position: absolute;
    right: -12px;
    top: 40px;
    width: 24px;
    height: 24px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    z-index: 40;
    opacity: 0;
  }
  .sidebar:hover .toggle-btn, .collapsed .toggle-btn { opacity: 1; }

  /* Main Content */
  .main-content { flex: 1; display: flex; flex-direction: column; }
  
  .topbar {
    height: var(--header-height);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
  }

  .search-box {
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    padding: 0 12px;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .search-box input {
    background: transparent;
    border: none;
    outline: none;
    font-size: 11px;
    width: 160px;
    color: var(--text-primary);
  }

  .topbar-right { display: flex; align-items: center; gap: 8px; }
  .icon-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    color: var(--text-secondary);
  }
  .icon-btn:hover { color: var(--color-primary); border-color: var(--color-primary); }

  .data-actions { display: flex; border-left: 1px solid var(--outline-color); margin-left: 8px; }

  /* Content */
  .content-area { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 12px; }

  .capture-bar { background: var(--bg-surface); border: 1px solid var(--outline-color); position: relative; }
  .capture-inner { height: var(--capture-height); display: flex; align-items: center; padding: 0 16px; gap: 12px; }
  .capture-inner input { flex: 1; background: transparent; border: none; outline: none; font-size: 14px; font-weight: 500; color: var(--text-primary); }
  .capture-accent { height: 2px; transition: background 0.3s; }

  .capture-targets { display: flex; gap: 4px; }
  .target-btn {
    padding: 0 12px;
    height: 28px;
    border: 1px solid var(--outline-color);
    font-size: 9px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
  .target-btn.active { background: var(--bg-app); border-color: transparent; font-weight: 800; }

  /* Matrix */
  .matrix-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; min-height: 0; }
  
  .quadrant {
    background: var(--q-color-soft, rgba(0,0,0,0.02));
    padding: 12px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    transition: all 0.3s;
    border: 1px solid transparent;
  }
  .quadrant.dim { opacity: 0.5; filter: grayscale(1); }
  .quadrant.drag-over { border: 2px solid var(--q-color); }

  .quadrant-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .q-title { display: flex; align-items: center; gap: 8px; color: var(--q-color); }
  .q-title h3 { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; }
  .q-meta { display: flex; align-items: center; gap: 8px; color: var(--q-color); opacity: 0.4; }
  .q-meta span { font-size: 7px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; }

  .purge-btn { font-size: 7px; font-weight: 900; background: var(--color-error); color: white; padding: 2px 6px; }

  /* Tasks */
  .task-list { flex: 1; overflow-y: auto; padding-right: 4px; }
  .task-card {
    height: var(--card-height);
    background: var(--bg-surface);
    border: 1px solid var(--outline-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    margin-bottom: 4px;
    cursor: grab;
    transition: transform 0.1s;
  }
  .task-card:hover { transform: translateY(-1px); border-color: var(--text-secondary); }
  .task-left { display: flex; align-items: center; gap: 10px; }
  .task-text { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .task-text.completed { text-decoration: line-through; opacity: 0.4; }

  .task-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
  .task-card:hover .task-actions { opacity: 1; }
  
  .action-btn { padding: 4px; color: var(--text-muted); }
  .action-btn:hover { color: var(--color-primary); }
  .action-btn.delete:hover { color: var(--color-error); }

  .checkbox-container { position: relative; width: 14px; height: 14px; cursor: pointer; }
  .checkbox-container input { display: none; }
  .checkmark {
    position: absolute;
    inset: 0;
    border: 2px solid var(--q-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  .checkbox-container input:checked + .checkmark { background: var(--q-color); }

  .add-task-btn {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    color: var(--q-color);
    opacity: 0.8;
  }
  .add-task-btn:hover { transform: translateX(2px); opacity: 1; }

  .empty-state {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--outline-color);
    font-size: 7px;
    font-weight: 800;
    letter-spacing: 0.2em;
    opacity: 0.3;
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar { width: 3px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); }

  /* Utilities */
  .compact-brand { font-size: 12px; font-weight: 800; color: var(--text-primary); }
</style>
