import { browser } from '$app/environment';
import type { Task } from './types';

class TaskService {
  tasks = $state<Task[]>([]);
  darkMode = $state(browser ? (localStorage.getItem('eisen-theme') === 'dark' || (!localStorage.getItem('eisen-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) : false);
  isSidebarCollapsed = $state(browser ? localStorage.getItem('eisen-sidebar-collapsed') === 'true' : false);
  isSettingsOpen = $state(false);
  isMobileCaptureOpen = $state(false);
  activeFilter = $state('all');
  searchQuery = $state('');

  constructor() {
    if (browser) {
      this.load();
    }
  }

  private load() {
    // 1. Load Tasks
    const savedTasks = localStorage.getItem('eisen-tasks');
    if (savedTasks) {
      try { this.tasks = JSON.parse(savedTasks); } catch (e) { console.error('Failed to parse tasks', e); }
    }

    // 2. Load Theme State
    const savedTheme = localStorage.getItem('eisen-theme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
    } else {
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // 3. Load Sidebar State
    const savedSidebar = localStorage.getItem('eisen-sidebar-collapsed');
    if (savedSidebar) {
      this.isSidebarCollapsed = savedSidebar === 'true';
    }

    // 4. Sync Classes
    this.updateThemeClass();
    this.updateSidebarClass();
  }

  save() {
    if (!browser) return;
    localStorage.setItem('eisen-tasks', JSON.stringify(this.tasks));
  }

  // Task Actions
  addTask(text: string, quadrant: number) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      quadrant,
      completed: false,
      timestamp: Date.now()
    };
    this.tasks = [newTask, ...this.tasks];
    this.save();
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  toggleTask(id: string) {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.save();
  }

  moveTask(id: string, quadrant: number) {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, quadrant } : t);
    this.save();
  }

  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.save();
  }

  purgeArchive() {
    this.tasks = this.tasks.filter(t => t.quadrant !== 4);
    this.save();
  }

  // UI State Actions
  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.updateThemeClass();
    localStorage.setItem('eisen-theme', this.darkMode ? 'dark' : 'light');
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.updateSidebarClass();
    localStorage.setItem('eisen-sidebar-collapsed', this.isSidebarCollapsed.toString());
  }

  private updateThemeClass() {
    if (!browser) return;
    if (this.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  private updateSidebarClass() {
    if (!browser) return;
    if (this.isSidebarCollapsed) document.documentElement.classList.add('sidebar-collapsed');
    else document.documentElement.classList.remove('sidebar-collapsed');
  }

  // Data Portability
  exportData() {
    const blob = new Blob([JSON.stringify(this.tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eisen-tasks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(json: string) {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        const existingIds = new Set(this.tasks.map(t => t.id));
        const newTasks = imported.filter((t: Task) => !existingIds.has(t.id));
        this.tasks = [...newTasks, ...this.tasks];
        this.save();
      }
    } catch (e) {
      console.error('Failed to import data', e);
    }
  }

  // Derived State
  get filteredTasks() {
    let res = this.tasks;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      res = res.filter(t => t.text.toLowerCase().includes(q));
    }
    return res;
  }

  get stats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }

  getCountsByQuadrant(quadrantId: number) {
    return this.tasks.filter(t => t.quadrant === quadrantId).length;
  }

  getTasksByQuadrant(quadrantId: number) {
    return this.filteredTasks
      .filter(t => t.quadrant === quadrantId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const taskService = new TaskService();
