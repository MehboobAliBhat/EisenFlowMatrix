<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Topbar from "$lib/components/Topbar.svelte";
  import CaptureBar from "$lib/components/CaptureBar.svelte";
  import Matrix from "$lib/components/Matrix.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";

  function handleGlobalKeydown(e: KeyboardEvent) {
    // Focus search/capture with '/'
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      const input = document.querySelector('.input-section input') as HTMLInputElement;
      input?.focus();
    }
    // Toggle theme with 'Alt + T'
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
  }

  .content-area {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .content-area {
      padding: 12px;
      gap: 8px;
    }
  }
</style>
