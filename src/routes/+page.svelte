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
    quadrant: number; // 1: Do, 2: Plan, 3: Handoff, 4: Void
    completed: boolean;
    timestamp: number;
  }

  // State using Svelte 5 Runes
  let tasks = $state<Task[]>([]);
  let newTaskText = $state('');
  let darkMode = $state(false);
  let searchQuery = $state('');
  let activeFilter = $state('all'); // 'all', '1', '2', '3', '4'
  let selectedQuadrant = $state(1); // For the Input Bar focus/target logic
  let isSidebarCollapsed = $state(false);
  
  let inputElement: HTMLInputElement;

  // Persistence
  onMount(() => {
    const savedTasks = localStorage.getItem('eisen-tasks');
    if (savedTasks) {
      try {
        tasks = JSON.parse(savedTasks);
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
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
    if (isSidebarCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  });

  $effect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eisen-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eisen-theme', 'light');
    }
  });

  // Actions
  async function addTask(explicitQuadrant?: number) {
    if (!newTaskText.trim()) return;
    
    const targetQuadrant = explicitQuadrant ?? selectedQuadrant;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      quadrant: targetQuadrant,
      completed: false,
      timestamp: Date.now()
    };
    tasks = [newTask, ...tasks]; // Newest first
    newTaskText = '';
    
    // Auto-reset focus to input box
    await tick();
    inputElement?.focus();
  }

  function deleteTask(id: string) {
    tasks = tasks.filter(t => t.id !== id);
  }

  function toggleTask(id: string) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  }

  function moveTask(id: string, newQuadrant: number) {
    tasks = tasks.map(t => t.id === id ? { ...t, quadrant: newQuadrant } : t);
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
  }

  function purgeVoid() {
    tasks = tasks.filter(t => t.quadrant !== 4);
  }

  function downloadData() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eisenhower-tasks.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleImport(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedTasks)) {
          const existingIds = new Set(tasks.map(t => t.id));
          const uniqueNewTasks = importedTasks.filter(t => !existingIds.has(t.id));
          tasks = [...uniqueNewTasks, ...tasks];
        }
      } catch (err) {
        console.error('Failed to import', err);
      }
    };
    reader.readAsText(file);
    target.value = '';
  }

  // Drag and Drop
  let draggedTaskId = $state<string | null>(null);
  let dragOverQuadrantId = $state<number | null>(null);
  let dragOverTrash = $state(false);

  function handleDragStart(e: DragEvent, id: string) {
    draggedTaskId = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent, quadrantId: number) {
    e.preventDefault();
    dragOverQuadrantId = quadrantId;
    dragOverTrash = false;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDragOverTrash(e: DragEvent) {
    e.preventDefault();
    dragOverTrash = true;
    dragOverQuadrantId = null;
  }

  function handleDragLeave() {
    dragOverQuadrantId = null;
    dragOverTrash = false;
  }

  function handleDrop(targetQuadrant: number) {
    if (draggedTaskId) {
      moveTask(draggedTaskId, targetQuadrant);
      draggedTaskId = null;
      dragOverQuadrantId = null;
    }
  }

  function handleTrashDrop() {
    if (draggedTaskId) {
      deleteTask(draggedTaskId);
      draggedTaskId = null;
      dragOverTrash = false;
    }
  }

  // Derived filtered tasks
  const filteredTasks = $derived(() => {
    let result = tasks;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => t.text.toLowerCase().includes(query));
    }
    return result;
  });

  const quadrants = [
    { 
      id: 1, 
      label: 'DO',
      title: 'DO', 
      subtitle: 'URGENT & IMPORTANT', 
      icon: Zap, 
      bg: 'bg-[#FFF1F1] dark:bg-red-950/20',
      headerBg: 'bg-[#FFD6D6] dark:bg-red-900/40', 
      accent: 'text-[#FF5F5F] dark:text-red-400',
      border: 'border-[#FF5F5F]',
      checkbox: 'checked:bg-[#FF5F5F] checked:border-[#FF5F5F]',
      activeIndicator: 'bg-[#FF5F5F]'
    },
    { 
      id: 2, 
      label: 'PLAN',
      title: 'PLAN', 
      subtitle: 'IMPORTANT & NOT URGENT', 
      icon: Calendar, 
      bg: 'bg-[#F1F7FF] dark:bg-blue-950/20',
      headerBg: 'bg-[#D6E8FF] dark:bg-blue-900/40', 
      accent: 'text-[#5F9FFF] dark:text-blue-400',
      border: 'border-[#5F9FFF]',
      checkbox: 'checked:bg-[#5F9FFF] checked:border-[#5F9FFF]',
      activeIndicator: 'bg-[#5F9FFF]'
    },
    { 
      id: 3, 
      label: 'HANDOFF',
      title: 'HANDOFF', 
      subtitle: 'URGENT & NOT IMPORTANT', 
      icon: Repeat, 
      bg: 'bg-[#FFF9F1] dark:bg-orange-950/20',
      headerBg: 'bg-[#FFEDD6] dark:bg-orange-900/40', 
      accent: 'text-[#FFB35F] dark:text-orange-400',
      border: 'border-[#FFB35F]',
      checkbox: 'checked:bg-[#FFB35F] checked:border-[#FFB35F]',
      activeIndicator: 'bg-[#FFB35F]'
    },
    { 
      id: 4, 
      label: 'VOID',
      title: 'VOID', 
      subtitle: 'NEITHER URGENT NOR IMPORTANT', 
      icon: Archive, 
      bg: 'bg-[#F8F8F8] dark:bg-slate-900/40',
      headerBg: 'bg-[#E5E5E5] dark:bg-slate-800/80', 
      accent: 'text-[#A0A0A0] dark:text-slate-400',
      border: 'border-[#D7D7D7]',
      checkbox: 'checked:bg-[#A0A0A0] checked:border-[#A0A0A0]',
      activeIndicator: 'bg-[#A0A0A0]'
    }
  ];

  function getTasksByQuadrant(id: number) {
    return filteredTasks().filter(t => t.quadrant === id).sort((a, b) => b.timestamp - a.timestamp);
  }

  const sidebarLinks = [
    { id: 'all', label: 'All Tasks', icon: ClipboardList, accent: 'text-[#FF5F5F]', activeBg: 'bg-[#FF5F5F]/10 dark:bg-red-900/20', hoverText: 'hover:text-[#FF5F5F]' },
    { id: '1', label: 'Do', icon: Zap, accent: 'text-[#FF5F5F]', activeBg: 'bg-[#FF5F5F]/10 dark:bg-red-900/20', hoverText: 'hover:text-[#FF5F5F]' },
    { id: '2', label: 'Plan', icon: Calendar, accent: 'text-[#5F9FFF]', activeBg: 'bg-[#5F9FFF]/10 dark:bg-blue-900/20', hoverText: 'hover:text-[#5F9FFF]' },
    { id: '3', label: 'Handoff', icon: Repeat, accent: 'text-[#FFB35F]', activeBg: 'bg-[#FFB35F]/10 dark:bg-orange-900/20', hoverText: 'hover:text-[#FFB35F]' },
    { id: '4', label: 'Void', icon: Archive, accent: 'text-[#A0A0A0]', activeBg: 'bg-[#A0A0A0]/10 dark:bg-slate-700/30', hoverText: 'hover:text-black dark:hover:text-white' }
  ];

  const getActiveAccent = () => {
    const q = quadrants.find(q => q.id === selectedQuadrant);
    return q ? q.accent : 'text-gray-400';
  };

  const getActiveIndicatorColor = () => {
    const q = quadrants.find(q => q.id === Number(activeFilter));
    if (activeFilter === 'all') return 'bg-[#FF5F5F]';
    return q ? q.activeIndicator : 'bg-gray-400';
  };
</script>

<div class="h-screen bg-[#FAFAFA] dark:bg-inverse-surface flex overflow-hidden text-[#1F2937] dark:text-inverse-on-surface transition-colors duration-200 font-sans">
  
  <aside 
    class={`bg-[#FCFCFC] dark:bg-inverse-surface border-r border-[#ECECEC] dark:border-outline flex flex-col justify-between relative shrink-0 transition-all duration-300 group/sidebar z-30 ${
      isSidebarCollapsed ? 'w-[70px]' : 'w-[240px]'
    }`}
  >
    <!-- Dynamic color indicator -->
    <div
      class={`absolute left-0 w-[4px] h-10 transition-all duration-300 ${getActiveIndicatorColor()}`}
      style="top: {activeFilter === 'all' ? '128px' : (128 + (sidebarLinks.findIndex(l => l.id === activeFilter) * 52) + 'px')};"
    ></div>

    <!-- Collapse Toggle Button (Restored Auto-hide) -->
    <button
      onclick={() => isSidebarCollapsed = !isSidebarCollapsed}
      class={`absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-inverse-surface border border-[#ECECEC] dark:border-outline rounded-full flex items-center justify-center text-gray-400 hover:text-[#FF5F5F] transition-all z-40 shadow-md toggle-btn ${
        isSidebarCollapsed ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <div class={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
    </button>

    <div class="overflow-hidden">
      <div class={`px-6 pt-8 pb-10 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 scale-90 h-0 overflow-hidden' : 'opacity-100'}`}>
        <h1 class="text-[16px] font-bold tracking-tight dark:text-white whitespace-nowrap">
          MatrixFlow Elite
        </h1>
        <p class="mt-1 text-[9px] tracking-[0.24em] font-semibold text-[#A8A8B5] uppercase whitespace-nowrap">
          PRECISION FOCUS
        </p>
      </div>

      <nav class={`space-y-1 px-2 transition-all duration-300 ${isSidebarCollapsed ? 'mt-20' : ''}`}>
        {#each sidebarLinks as link}
          <button
            onclick={() => activeFilter = link.id}
            class={`w-full flex items-center gap-4 px-4 py-3 text-left group transition-colors duration-200 sidebar-btn ${
              activeFilter === link.id
                ? `${link.activeBg} text-[#1F2937] dark:text-white font-bold`
                : `text-[#A8A8B5] dark:text-surface-variant`
            }`}
            title={isSidebarCollapsed ? link.label : ''}
          >
            <link.icon 
              size={18} 
              class={`shrink-0 transition-colors duration-200 ${link.accent} ${
                activeFilter === link.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`} 
            />
            <span class={`text-[14px] font-medium transition-all duration-300 whitespace-nowrap ${
              isSidebarCollapsed ? 'opacity-0 w-0' : `opacity-100 ${link.hoverText.replace('hover:', 'group-hover:')}`
            }`}>
              {link.label}
            </span>
          </button>
        {/each}
      </nav>
    </div>

    <div class="p-3 overflow-hidden">
      <div class="border-t border-[#ECECEC] dark:border-outline pt-3 flex flex-col gap-2">
        <div 
          role="region"
          aria-label="Trash area"
          ondragover={handleDragOverTrash}
          ondragleave={handleDragLeave}
          ondrop={handleTrashDrop}
          class={`w-full flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed 
            ${isSidebarCollapsed ? 'px-2 py-4' : 'px-4 py-6'}
            ${
            dragOverTrash 
              ? 'bg-error/10 text-error border-error scale-[1.02]' 
              : 'text-[#8B95A7] dark:text-surface-variant border-[#ECECEC] dark:border-outline/30 hover:border-error/50 hover:bg-white dark:hover:bg-white/5'
          }`}
        >
          {#if dragOverTrash}
            <Trash2 size={isSidebarCollapsed ? 18 : 22} class="text-error" />
          {:else}
            <Trash size={isSidebarCollapsed ? 18 : 22} />
          {/if}
          <span class={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
            Trash
          </span>
        </div>

        <div class="mt-2 pt-3 border-t border-[#ECECEC] dark:border-outline flex flex-col gap-0.5">
          <button
            onclick={clearCompleted}
            class="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white dark:hover:bg-white/5 transition-colors duration-200 text-[#8B95A7] dark:text-surface-variant hover:text-error dark:hover:text-red-400 sidebar-btn"
            title={isSidebarCollapsed ? 'Clear Done' : ''}
          >
            <Eraser size={16} class="shrink-0" />
            <span class={`text-[13px] font-medium transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Clear Done
            </span>
          </button>

          <button 
            class="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white dark:hover:bg-white/5 transition-colors duration-200 text-[#8B95A7] dark:text-surface-variant hover:text-[#5F9FFF] sidebar-btn"
            title={isSidebarCollapsed ? 'Settings' : ''}
          >
            <Settings size={16} class="shrink-0" />
            <span class={`text-[13px] font-medium transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="flex-1 overflow-hidden flex flex-col">
    <!-- TOPBAR -->
    <header class="flex items-center justify-between px-6 py-3 shrink-0 z-20">
      <div class="flex-1 flex items-center gap-4">
        {#if isSidebarCollapsed}
          <h1 class="text-sm font-bold dark:text-white">MatrixFlow</h1>
        {/if}
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-white dark:bg-white/5 px-4 h-9 flex items-center gap-3 shadow-sm border border-[#EEEEEE] dark:border-outline transition-all focus-within:ring-1 ring-primary/20">
          <Search size={14} class="text-[#A0A0A0]" />
          <input
            bind:value={searchQuery}
            class="bg-transparent outline-none border-none focus:ring-0 text-xs w-48 placeholder:text-[#B8B8C3] dark:text-white"
            placeholder="Quick find tasks..."
          />
        </div>

        <button
          onclick={() => darkMode = !darkMode}
          class="w-9 h-9 bg-white dark:bg-white/5 shadow-sm border border-[#EEEEEE] dark:border-outline flex items-center justify-center text-[#5F6FFF] transition-all"
        >
          {#if darkMode}
            <Sun size={15} />
          {:else}
            <Moon size={15} />
          {/if}
        </button>

        <div class="flex items-center bg-white dark:bg-white/5 shadow-sm border border-[#EEEEEE] dark:border-outline">
          <label class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#5F9FFF] cursor-pointer transition-all border-r border-[#EEEEEE] dark:border-outline" title="Import JSON">
            <input type="file" accept=".json" class="hidden" onchange={handleImport} />
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </label>
          <button
            onclick={downloadData}
            class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#5F9FFF] transition-all"
            title="Export JSON"
          >
            <Download size={15} />
          </button>
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <div class="px-6 pb-6 flex-1 flex flex-col gap-4 overflow-hidden">
      <!-- CAPTURE BAR -->
      <div class="w-full shrink-0">
        <div class="bg-white dark:bg-inverse-surface shadow-sm border border-[#F0F0F0] dark:border-outline overflow-hidden transition-all">
          <div class="flex items-center h-12 px-4">
            <div class="mr-3">
              <Zap size={16} class={getActiveAccent()} />
            </div>

            <input
              bind:this={inputElement}
              bind:value={newTaskText}
              onkeydown={(e) => e.key === "Enter" && addTask()}
              onfocus={() => { if (activeFilter !== 'all') selectedQuadrant = parseInt(activeFilter); }}
              placeholder="Capture a new task..."
              class="flex-1 h-full outline-none text-[15px] font-medium bg-transparent border-none focus:ring-0 dark:text-white placeholder:text-gray-300"
            />

            <div class="flex h-full items-center gap-1">
              {#each quadrants.slice(0, 3) as q}
                <button
                  onfocus={() => selectedQuadrant = q.id}
                  onclick={() => addTask(q.id)}
                  class={`h-8 px-4 border text-[10px] font-bold tracking-wide transition-all uppercase
                    ${selectedQuadrant === q.id 
                      ? `${q.accent} ${q.bg} border-transparent ring-1 ring-black/5` 
                      : 'text-gray-400 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 bg-transparent'}`}
                >
                  {q.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- COLOR BRIDGE -->
          <div
            class={`h-[2px] transition-all duration-300 ${
              selectedQuadrant === 1 ? 'bg-[#FF5F5F]' :
              selectedQuadrant === 2 ? 'bg-[#5F9FFF]' :
              selectedQuadrant === 3 ? 'bg-[#FFB35F]' : 'bg-[#D8D8D8]'
            }`}
          ></div>
        </div>
      </div>

      <!-- QUADRANTS -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-none lg:grid-rows-2 gap-4 min-h-0 overflow-hidden">
        {#each quadrants as q}
          {#if activeFilter === 'all' || activeFilter === q.id.toString()}
            <section
              aria-label={`${q.title} quadrant`}
              ondragover={(e) => handleDragOver(e, q.id)}
              ondragleave={handleDragLeave}
              ondrop={() => handleDrop(q.id)}
              class={`${q.bg} p-4 flex flex-col min-h-0 transition-all duration-300 overflow-hidden 
                ${q.id === 4 ? 'opacity-50 grayscale' : ''}
                ${dragOverQuadrantId === q.id ? 'ring-4 ring-inset ring-black/5 z-20' : ''}`}
            >
              <!-- HEADER -->
              <div class="flex items-center justify-between mb-3 shrink-0">
                <div class={`flex items-center gap-2 ${q.accent}`}>
                  <q.icon size={18} stroke-width={3} />
                  <h2 class="text-[16px] tracking-[0.1em] font-black">{q.title}</h2>
                </div>
                <div class="flex items-center gap-3">
                  {#if q.id === 4 && getTasksByQuadrant(4).length > 0}
                    <button 
                      onclick={purgeVoid}
                      class="px-2 py-0.5 bg-white/50 dark:bg-black/20 hover:bg-[#ba1a1a] hover:text-white text-[8px] font-bold transition-all uppercase tracking-widest active:scale-95"
                    >
                      Purge
                    </button>
                  {/if}
                  <p class={`text-[8px] tracking-[0.2em] font-black opacity-30 ${q.accent}`}>{q.subtitle}</p>
                </div>
              </div>

              <!-- TASKS -->
              <div class="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                {#each getTasksByQuadrant(q.id) as task (task.id)}
                  <div
                    draggable="true"
                    role="listitem"
                    ondragstart={(e) => handleDragStart(e, task.id)}
                    class="bg-white dark:bg-white/5 h-11 px-3 flex items-center justify-between group transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-white/90 dark:hover:bg-white/10 shadow-sm"
                  >
                    <div class="flex items-center gap-3 flex-1">
                      <label class="relative shrink-0 flex items-center">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onchange={() => toggleTask(task.id)}
                          class={`peer appearance-none w-4 h-4 border-2 bg-transparent transition-all duration-200 cursor-pointer
                            ${q.border} ${q.checkbox}`}
                        />
                        <Check 
                          size={10} 
                          stroke-width={4} 
                          class="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" 
                        />
                      </label>

                      <span class={`text-[13px] font-semibold text-[#334155] dark:text-white/80 transition-all ${task.completed ? "line-through opacity-40" : ""}`}>
                        {task.text}
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {#each quadrants.slice(0, 3) as targetQ}
                        {#if targetQ.id !== q.id}
                          <button 
                            onclick={() => moveTask(task.id, targetQ.id)}
                            class={`${targetQ.accent} hover:bg-black/5 dark:hover:bg-white/5 p-1 transition-all active:scale-90`} 
                            title={`Move to ${targetQ.label}`}
                          >
                            <targetQ.icon size={12} />
                          </button>
                        {/if}
                      {/each}
                      <button
                        onclick={() => deleteTask(task.id)}
                        class="text-red-400 hover:text-[#FF5F5F] p-1 transition-all active:scale-90"
                      >
                        <Trash2 size={14} stroke-width={2} />
                      </button>
                    </div>
                  </div>
                {/each}
                
                {#if getTasksByQuadrant(q.id).length === 0}
                  <div class="h-12 flex flex-col items-center justify-center border border-dashed border-black/[0.05] dark:border-white/[0.05] opacity-40 transition-opacity">
                    <span class="text-[8px] font-bold uppercase tracking-widest italic">No Items</span>
                  </div>
                {/if}
              </div>

              <button
                onclick={() => { selectedQuadrant = q.id; inputElement?.focus(); }}
                class={`mt-2 flex items-center gap-2 text-[11px] font-bold transition-all hover:translate-x-1 ${q.accent}`}
              >
                <Plus size={12} stroke-width={3} />
                Add new task
              </button>
            </section>
          {/if}
        {/each}
      </div>
    </div>
  </main>
</div>

<style>
  :global(body, html) {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background-color: #FAFAFA;
    user-select: none;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Force hover visibility for testing */
  .sidebar-btn:hover {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }
  .dark .sidebar-btn:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
  }

  /* Robust Sidebar Toggle Visibility */
  .group\/sidebar:hover .toggle-btn {
    opacity: 1 !important;
  }

  /* Global Sidebar Hydration Overrides */
  :global(.sidebar-collapsed) aside {
    width: 70px !important;
  }
  :global(.sidebar-collapsed) aside h1,
  :global(.sidebar-collapsed) aside p,
  :global(.sidebar-collapsed) aside span {
    opacity: 0 !important;
    width: 0 !important;
    display: none !important;
  }
  :global(.sidebar-collapsed) .toggle-btn {
    opacity: 1 !important;
  }

  :global(input) {
    user-select: text;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.06);
    border-radius: 0px;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.06);
  }
</style>
