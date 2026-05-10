<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Topbar from "$lib/components/Topbar.svelte";
  import CaptureBar from "$lib/components/CaptureBar.svelte";
  import Matrix from "$lib/components/Matrix.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";

  function handleGlobalKeydown(e: KeyboardEvent) {
    const isInputActive = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    // 1. Focus Capture with '/' (Restored original behavior)
    if (e.key === '/' && !isInputActive) {
      e.preventDefault();
      const captureInput = document.querySelector('.input-section input') as HTMLInputElement;
      captureInput?.focus();
    }

    // 2. Focus Search with 'f'
    if (e.key.toLowerCase() === 'f' && !isInputActive) {
      e.preventDefault();
      const searchInput = document.querySelector('.top-search-input') as HTMLInputElement;
      searchInput?.focus();
    }

    // 3. Clear focus with 'Escape'
    if (e.key === 'Escape') {
      (document.activeElement as HTMLElement)?.blur();
    }

    // 4. Toggle theme with 'Alt + T'
    if (e.altKey && e.key === 't') {
      import('$lib/tasks.svelte').then(m => m.taskService.toggleTheme());
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="app-container">
  <Sidebar />

  <main class="main-content">
    <Topbar />

    <div class="content-area">
      <CaptureBar />
      <Matrix />
    </div>
  </main>

  <SettingsModal />
</div>

<style>
  .app-container {
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

  @media (max-width: 768px) {
    .content-area {
      padding: 12px;
      gap: 8px;
    }
  }
</style>
