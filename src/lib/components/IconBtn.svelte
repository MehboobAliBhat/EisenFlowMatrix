<script lang="ts">
  let { 
    onclick, 
    title = '', 
    class: className = '', 
    children,
    style = ''
  } = $props();
</script>

<button 
  class="icon-btn {className}" 
  {onclick} 
  {title}
  {style}
>
  {@render children()}
</button>

<style>
  .icon-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    transition: all var(--transition-base);
    border-radius: var(--radius);
    position: relative;
    overflow: hidden;
  }
  
  .icon-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-primary);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .icon-btn:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }

  .icon-btn:hover::before {
    opacity: 0.05;
  }

  .icon-btn:active {
    transform: scale(0.94);
  }

  :global(.icon-btn svg) {
    position: relative;
    z-index: 1;
    transition: transform var(--transition-fast);
  }

  .icon-btn:hover :global(svg) {
    transform: scale(1.1);
  }
</style>