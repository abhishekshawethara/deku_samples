<script>
  import { onDestroy, onMount, tick } from 'svelte';

  export let open = false;
  export let title = '';
  export let onClose = () => {};
  export let labelledBy = 'zj-modal-title';

  let panel;
  let opener = null;

  async function focusFirst() {
    await tick();
    if (!panel) return;
    const target =
      panel.querySelector('[data-autofocus]') ||
      panel.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    (target || panel).focus();
  }

  $: if (open) {
    if (typeof document !== 'undefined' && !opener) opener = document.activeElement;
    focusFirst();
  }

  function close() {
    const back = opener;
    opener = null;
    onClose();
    if (back && typeof back.focus === 'function') setTimeout(() => back.focus(), 0);
  }

  function onKeydown(e) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab' && panel) {
      const items = [...panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  onMount(() => {
    document.addEventListener('keydown', onKeydown);
  });
  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown);
  });
</script>

{#if open}
  <div class="scrim" role="presentation" on:click={close}></div>
  <div class="shell" role="dialog" aria-modal="true" aria-labelledby={labelledBy} bind:this={panel} tabindex="-1">
    <div class="head">
      <h2 id={labelledBy}>{title}</h2>
      <button type="button" class="x" on:click={close} aria-label="Close this dialog">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2" />
        </svg>
        <span class="sr-only">Close</span>
      </button>
    </div>
    <div class="body">
      <slot />
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(20, 18, 15, 0.5);
    z-index: 60;
  }
  .shell {
    position: fixed;
    z-index: 61;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(620px, calc(100vw - 32px));
    max-height: min(84vh, 780px);
    overflow: auto;
    background: var(--paper);
    border: 1px solid var(--rule-strong);
    border-radius: var(--radius);
    box-shadow: 0 24px 60px rgba(11, 31, 61, 0.28);
  }
  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 18px 0;
  }
  .head h2 {
    font-size: 1.3rem;
    margin: 0;
  }
  .x {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--rule-strong);
    border-radius: var(--radius-sm);
    background: var(--paper);
    color: var(--ink);
    cursor: pointer;
  }
  .x:hover {
    background: var(--paper-warm);
  }
  .x:active {
    background: var(--paper-grey);
  }
  .body {
    padding: 14px 18px 20px;
  }
</style>
