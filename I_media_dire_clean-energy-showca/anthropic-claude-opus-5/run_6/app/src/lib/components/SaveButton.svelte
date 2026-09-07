<script>
	import { post, del, ApiError } from '$lib/api.js';
	import { auth, savedSlugs, setSaveToken, currentSaveToken } from '$lib/stores.js';
	import { createEventDispatcher } from 'svelte';

	export let slug;
	export let compact = false;

	const dispatch = createEventDispatcher();
	let busy = false;
	let error = '';

	$: saved = $savedSlugs.has(slug);

	async function toggle() {
		busy = true;
		error = '';
		try {
			if (saved) {
				const token = $auth.token ? undefined : currentSaveToken();
				const list = await fetchSaves(token);
				const row = list.find((r) => r.slug === slug);
				if (row) {
					const qs = !$auth.token && token ? `?save_token=${encodeURIComponent(token)}` : '';
					await del(`/saves/${row.id}${qs}`);
				}
				savedSlugs.update((s) => {
					const n = new Set(s);
					n.delete(slug);
					return n;
				});
			} else {
				const body = { solution_slug: slug };
				if (!$auth.token) {
					const t = currentSaveToken();
					if (t) body.save_token = t;
				}
				const res = await post('/saves', body);
				if (res?.save_token) setSaveToken(res.save_token);
				savedSlugs.update((s) => new Set(s).add(slug));
			}
			dispatch('changed', { slug, saved: !saved });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not reach the server. Try again.';
		} finally {
			busy = false;
		}
	}

	async function fetchSaves(token) {
		const qs = token ? `?save_token=${encodeURIComponent(token)}` : '';
		const res = await fetch(`/api/saves${qs}`, {
			headers: $auth.token ? { authorization: `Bearer ${$auth.token}` } : {}
		});
		if (!res.ok) return [];
		return await res.json();
	}
</script>

<div class="save-wrap">
	<button
		class="btn btn-sm"
		class:saved
		type="button"
		disabled={busy}
		aria-pressed={saved}
		on:click={toggle}
	>
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		{#if saved}
			<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
				<path
					d="M2.5 8.5 L6.2 12 L13.5 4.2"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
		<span>{saved ? 'Saved' : compact ? 'Save' : 'Save solution'}</span>
	</button>
	{#if error}<p class="error-text" role="alert">{error}</p>{/if}
</div>

<style>
	.save-wrap {
		display: inline-block;
	}
	.saved {
		border-color: var(--success);
		color: var(--success);
		background: var(--success-tint);
	}
	.saved:hover {
		background: var(--success-tint);
		color: var(--success);
	}
</style>
