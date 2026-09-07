<script>
	/* Hydrated island: saves work before there is an account to save to.
	   An anonymous save mints a save_token which sign-in claims. */
	import { api, getToken, getSaveToken, setSaveToken, ApiError } from '$lib/api.js';
	import { savedSlugs, refreshSaves } from '$lib/session.js';
	import { createEventDispatcher } from 'svelte';

	export let slug;
	export let small = false;

	const dispatch = createEventDispatcher();
	let busy = false;
	let error = '';

	$: saved = $savedSlugs.has(slug);

	async function toggle() {
		if (busy) return;
		busy = true;
		error = '';
		try {
			if (saved) {
				const token = getToken();
				const saveToken = getSaveToken();
				const rows = await api(`/saves${!token && saveToken ? `?save_token=${encodeURIComponent(saveToken)}` : ''}`);
				const row = rows.find((r) => r.slug === slug);
				if (row) {
					await api(
						`/saves/${row.id}${!token && saveToken ? `?save_token=${encodeURIComponent(saveToken)}` : ''}`,
						{ method: 'DELETE' }
					);
				}
			} else {
				const saveToken = getSaveToken();
				const res = await api('/saves', {
					method: 'POST',
					body: { solution_slug: slug, ...(!getToken() && saveToken ? { save_token: saveToken } : {}) }
				});
				if (res?.save_token) setSaveToken(res.save_token);
			}
			await refreshSaves();
			dispatch('changed', { slug, saved: !saved });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'That did not save. Try again.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="save">
	<button
		type="button"
		class="btn {saved ? 'btn--ghost' : ''} {small ? 'btn--small' : ''}"
		aria-pressed={saved}
		disabled={busy}
		on:click={toggle}
		data-testid="save-{slug}"
	>
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		{saved ? 'Saved' : 'Save'}
		<span class="visually-hidden">{saved ? `Remove ${slug} from saved solutions` : `Save ${slug}`}</span>
	</button>
	{#if error}
		<p class="save__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.save {
		display: inline-block;
	}
	.save__error {
		color: var(--fail);
		font-size: 0.8rem;
		font-weight: 600;
		margin: 0.35rem 0 0;
	}
</style>
