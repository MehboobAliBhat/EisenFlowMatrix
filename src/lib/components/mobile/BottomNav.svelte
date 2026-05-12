<script lang="ts">
  import { SIDEBAR_LINKS } from "$lib/config";
  import { taskService } from "$lib/tasks.svelte";
  import { Settings } from "lucide-svelte";

  const navItems = [
    ...SIDEBAR_LINKS.filter(l => l.id === 'all' || l.id === '1' || l.id === '2' || l.id === '3'),
    { id: 'settings', label: 'Settings', icon: Settings, var: '--color-primary', soft: '--color-primary-soft' }
  ];
</script>

<nav class="bottom-nav">
  {#each navItems as item}
    <button 
      class="nav-item" 
      class:active={taskService.activeFilter === item.id || (item.id === 'settings' && taskService.isSettingsOpen)}
      onclick={() => {
        if (item.id === 'settings') {
          taskService.isSettingsOpen = true;
        } else {
          taskService.activeFilter = item.id;
        }
      }}
      style="--item-color: var({item.var})"
    >
      <div class="icon-wrapper">
        <item.icon size={20} />
      </div>
      <span class="label">{item.label}</span>
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--bg-sidebar);
    border-top: 1px solid var(--border-color);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
    justify-content: space-around;
    align-items: center;
  }

  @media (max-width: 768px) {
    .bottom-nav {
      display: flex;
    }
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 100%;
    color: var(--text-muted);
    transition: all var(--transition-fast);
    background: transparent;
    border: none;
    padding: 0;
  }

  .nav-item.active {
    color: var(--item-color);
  }

  .icon-wrapper {
    transition: transform var(--transition-fast);
  }

  .nav-item.active .icon-wrapper {
    transform: translateY(-2px);
  }

  .label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
