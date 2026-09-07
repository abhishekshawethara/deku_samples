<script>
	// The save control. A save works before there is an account to save it to:
	// the server mints an opaque save_token which sign in then claims.
	import { createEventDispatcher } from 'svelte';
	import { api } from '$lib/api.js';
	import { token, saveToken, account } from '$lib/session.js';

	export let slug;
	export let saved = false;
	export let savedId = null;
	export let compact = false;

	const dispatch = createEventDispatcher();
	let busy = false;
	let error = '';
	let note = '';

	async function toggle() {
		busy = true;
		error = '';
		note = '';
		try {
			if (saved && savedId) {
				const qs = !$token && $saveToken ? `?save_token=${encodeURIComponent($saveToken)}` : '';
				await api(`/api/saves/${savedId}${qs}`, { method: 'DELETE', token: $token });
				saved = false;
				savedId = null;
				note = 'Removed from your saved solutions.';
			} else {
				const row = await api('/api/saves', {
					method: 'POST',
					token: $token,
					body: { solution_slug: slug, save_token: $token ? undefined : $saveToken || undefined }
				});
				if (!$token && row.save_token) saveToken.set(row.save_token);
				saved = true;
				savedId = row.id;
				note = $account ? 'Saved to your account.' : 'Saved. Sign in to keep it on an account.';
			}
			dispatch('changed', { slug, saved, id: savedId });
		} catch (err) {
			error = err.message || 'That save could not be recorded. Try again.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="save">
	<button
		type="button"
		class="btn {saved ? 'btn-quiet' : 'btn-secondary'} {compact ? 'btn-sm' : ''}"
		on:click={toggle}
		disabled={busy}
		aria-pressed={saved}
		data-testid={`save-${slug}`}
	>
		{#if busy}
			<span class="spinner" aria-hidden="true"></span>
		{/if}
		<span>{saved ? 'Saved' : 'Save'}</span>
		<span class="visually-hidden">{saved ? `Remove ${slug} from saved` : `Save ${slug}`}</span>
	</button>
	{#if error}
		<p class="field-error" role="alert">{error}</p>
	{:else if note}
		<p class="field-hint" role="status">{note}</p>
	{/if}
</div>

<style>
	.save {
		display: inline-flex;
		flex-direction: column;
		gap: 2px;
	}
	.spinner {
		width: 13px;
		height: 13px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		display: inline-block;
	}
</style>
