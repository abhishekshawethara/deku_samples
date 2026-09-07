<script>
	import { api, ApiError } from '$lib/api.js';
	import { currentToken, currentSaveToken, setSaveToken } from '$lib/session.js';

	let { slug, label = 'Save', small = false, onsaved } = $props();

	let busy = $state(false);
	let state_ = $state('idle'); // idle | saved | error
	let message = $state('');

	async function save() {
		if (busy) return;
		busy = true;
		message = '';
		try {
			const t = currentToken();
			const body = { solution_slug: slug };
			if (!t) {
				const existing = currentSaveToken();
				if (existing) body.save_token = existing;
			}
			const { data } = await api('/api/saves', { method: 'POST', body, token: t || undefined });
			if (!t && data?.save_token) setSaveToken(data.save_token);
			state_ = 'saved';
			message = t ? 'Saved to your account.' : 'Saved. Sign in to keep it on an account.';
			onsaved?.(data);
		} catch (err) {
			state_ = 'error';
			message =
				err instanceof ApiError
					? err.message
					: 'We could not save that just now. Try again in a moment.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="save">
	<button
		class={`btn ${small ? 'btn-sm' : ''} ${state_ === 'saved' ? 'btn-quiet' : 'btn-primary'}`}
		type="button"
		onclick={save}
		disabled={busy}
		data-testid={`save-${slug}`}
	>
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		{#if state_ === 'saved'}
			<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
				<path
					d="M3 8.5 L6.5 12 L13 4.5"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Saved
		{:else}
			{busy ? 'Saving' : label}
		{/if}
	</button>
	{#if message}
		<p
			class={`note ${state_ === 'error' ? 'note-error' : 'note-ok'}`}
			role={state_ === 'error' ? 'alert' : 'status'}
		>
			{message}
		</p>
	{/if}
</div>

<style>
	.save {
		display: block;
	}
	.note {
		margin: 6px 0 0;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.note-ok {
		color: var(--success);
	}
	.note-error {
		color: var(--failure);
	}
</style>
