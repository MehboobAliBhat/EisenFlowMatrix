<script lang="ts">
  import { Check } from "lucide-svelte";
  
  let { checked = $bindable(false), color = 'var(--color-primary)', onchange } = $props();
</script>

<label class="checkbox-container">
  <input type="checkbox" bind:checked {onchange} />
  <div class="checkmark-wrapper">
    <div class="checkmark" style="--q-color: {color}">
      {#if checked}
        <Check size={8} stroke-width={4} />
      {/if}
    </div>
  </div>
</label>

<style>
  .checkbox-container {
    position: relative;
    width: 32px; /* Expanded hit area */
    height: 32px; /* Expanded hit area */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -8px; /* Offset for better alignment within the task card */
  }
  
  .checkbox-container input {
    display: none;
  }

  .checkmark-wrapper {
    width: 14px;
    height: 14px;
    position: relative;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .checkbox-container:hover .checkmark-wrapper {
    transform: scale(1.4);
  }
  
  .checkmark {
    position: absolute;
    inset: 0;
    border: 2px solid var(--q-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background 0.2s, border-color 0.2s;
    border-radius: var(--radius);
  }
  
  .checkbox-container input:checked + .checkmark-wrapper .checkmark {
    background: var(--q-color);
  }
</style>
