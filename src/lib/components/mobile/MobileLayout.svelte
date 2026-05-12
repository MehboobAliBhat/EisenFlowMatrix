<script lang="ts">
  import MobileTopbar from "./MobileTopbar.svelte";
  import MobileMatrix from "./MobileMatrix.svelte";
  import BottomNav from "./BottomNav.svelte";
  import FAB from "./FAB.svelte";
  import MobileCapture from "./MobileCapture.svelte";
  import MobileSettingsModal from "./MobileSettingsModal.svelte";
</script>

<div class="mobile-layout">
  <main class="main-content">
    <MobileTopbar />

    <div class="content-area">
      <MobileMatrix />
    </div>

    <BottomNav />
    <FAB />
  </main>

  <MobileCapture />
  <MobileSettingsModal />
</div>

<style>
  .mobile-layout {
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

  .content-area {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
</style>
