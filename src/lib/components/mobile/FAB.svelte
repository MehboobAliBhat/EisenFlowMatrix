<script lang="ts">
  import { Plus } from "lucide-svelte";
  import { taskService } from "$lib/tasks.svelte";
</script>

<button 
  class="fab" 
  onclick={() => taskService.isMobileCaptureOpen = true}
  aria-label="Add new task"
>
  <Plus size={28} />
</button>

<style>
  .fab {
    display: none;
    position: fixed;
    right: 20px;
    bottom: 84px; /* Above bottom nav */
    width: 56px;
    height: 56px;
    background: var(--color-primary);
    color: #ffffff;
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 90;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-fast), background var(--transition-base);
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .fab {
      display: flex;
    }
  }

  .fab:active {
    transform: scale(0.9);
  }

  .fab :global(svg) {
    stroke-width: 3;
  }
</style>
