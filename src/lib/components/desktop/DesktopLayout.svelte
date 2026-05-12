<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
  import DesktopTopbar from "./DesktopTopbar.svelte";
  import DesktopCaptureBar from "./DesktopCaptureBar.svelte";
  import DesktopMatrix from "./DesktopMatrix.svelte";
  import DesktopSettingsModal from "./DesktopSettingsModal.svelte";

  function handleGlobalKeydown(e: KeyboardEvent) {
    const isInputActive = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    if (e.key === '/' && !isInputActive) {
      e.preventDefault();
      const captureInput = document.querySelector('.input-section input') as HTMLInputElement;
      captureInput?.focus();
    }

    if (e.key.toLowerCase() === 'f' && !isInputActive) {
      e.preventDefault();
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      searchInput?.focus();
    }

    if (e.key === 'Escape') {
      (document.activeElement as HTMLElement)?.blur();
    }

    if (e.altKey && e.key === 't') {
      import('$lib/tasks.svelte').then(m => m.taskService.toggleTheme());
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="desktop-layout">
  <Sidebar />

  <main class="main-content">
    <DesktopTopbar />

    <div class="content-area">
      <DesktopCaptureBar />
      <DesktopMatrix />
    </div>
  </main>

  <DesktopSettingsModal />
</div>

<style>
  .desktop-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: var(--bg-app);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .main-content::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 40%;
    height: 40%;
    background: radial-gradient(circle, var(--color-primary-soft) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  .content-area {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
</style>
