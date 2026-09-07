<script>
  import { api, getSaveToken, setSaveToken, getToken } from '$lib/api';

  export let slug;
  export let saved = false;
  export let saveId = null;
  export let small = false;
  export let onChange = () => {};

  let busy = false;
  let message = '';
  let tone = 'info';

  async function toggle() {
    if (busy) return;
    busy = true;
    message = '';
    try {
      if (saved && saveId) {
        const st = getToken() ? '' : `?save_token=${encodeURIComponent(getSaveToken() || '')}`;
        await api(`/saves/${saveId}${st}`, { method: 'DELETE' });
        saved = false;
        saveId = null;
        tone = 'info';
        message = 'Removed from your saved solutions.';
      } else {
        const body = { solution_slug: slug };
        if (!getToken()) {
          const st = getSaveToken();
          if (st) body.save_token = st;
        }
        const { data } = await api('/saves', { method: 'POST', body });
        if (data.save_token) setSaveToken(data.save_token);
        saved = true;
        saveId = data.id;
        tone = 'success';
        message = data.already_saved
          ? 'Already saved. Kept as one entry.'
          : getToken()
            ? 'Saved to your account.'
            : 'Saved. Sign in and it follows you in.';
      }
      onChange({ slug, saved, id: saveId });
    } catch (err) {
      tone = 'failure';
      message = err.message || 'That save could not be recorded. Try again.';
    } finally {
      busy = false;
    }
  }
</script>

<div class="save">
  <button
    type="button"
    class="btn {saved ? 'btn-secondary' : ''} {small ? 'btn-sm' : ''}"
    on:click={toggle}
    disabled={busy}
    aria-pressed={saved}
    data-testid={`save-${slug}`}
  >
    {#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
    {saved ? 'Saved' : 'Save'}
    <span class="sr-only">{saved ? `${slug} is saved. Activate to remove it.` : `Save ${slug}`}</span>
  </button>
  {#if message}
    <p class="note {tone}" role="status" data-testid={`save-msg-${slug}`}>{message}</p>
  {/if}
</div>

<style>
  .save {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }
  .note {
    margin: 0;
    font-size: 0.8rem;
  }
  .note.success {
    color: var(--success);
  }
  .note.failure {
    color: var(--failure);
    font-weight: 600;
  }
  .note.info {
    color: var(--ink-muted);
  }
</style>
