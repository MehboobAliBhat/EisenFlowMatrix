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
  class="icon-btn industrial-hover {className}" 
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
    border: 1px solid var(--outline-color);
    color: var(--text-secondary);
    transition: all 0.2s;
    border-radius: var(--radius);
  }
  
  .icon-btn:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
</style>
