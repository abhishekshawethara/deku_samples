<script>
	// The save control. It works before there is an account to save to: an
	// anonymous save returns an opaque save_token which is kept and later
	// claimed at sign in.
	import { get } from 'svelte/store';
	import { api, ApiError } from '$lib/api.js';
	import { saveTokenStore, token as authToken } from '$lib/auth.js';
	import { savedSlugs, savedIds, refreshSaves } from '$lib/saves.js';

	let { slug, compact = false, onmessage } = $props();

	let busy = $state(false);

	const saved = $derived($savedSlugs.has(slug));

	async function save() {
		busy = true;
		try {
			const signedIn = Boolean(get(authToken));
			const st = get(saveTokenStore);
			const { data } = await api('/saves', {
				method: 'POST',
				body: { solution_slug: slug, ...(!signedIn && st ? { save_token: st } : {}) }
			});
			if (data.save_token) saveTokenStore.set(data.save_token);
			await refreshSaves();
			onmessage?.({
				kind: 'ok',
				text: signedIn
					? 'Saved. It is waiting in your account.'
					: 'Saved. Sign in and it follows you in.'
			});
		} catch (e) {
			onmessage?.({
				kind: 'fail',
				text: e instanceof ApiError ? e.message : 'Could not save that just now.'
			});
		} finally {
			busy = false;
		}
	}

	async function unsave() {
		busy = true;
		try {
			const id = get(savedIds).get(slug);
			const signedIn = Boolean(get(authToken));
			const st = get(saveTokenStore);
			const qs = !signedIn && st ? `?save_token=${encodeURIComponent(st)}` : '';
			await api(`/saves/${id}${qs}`, { method: 'DELETE' });
			await refreshSaves();
			onmessage?.({ kind: 'ok', text: 'Removed from your saves.' });
		} catch (e) {
			onmessage?.({
				kind: 'fail',
				text: e instanceof ApiError ? e.message : 'Could not remove that just now.'
			});
		} finally {
			busy = false;
		}
	}
</script>

<button
	class="btn {compact ? 'btn--sm' : ''} {saved ? 'btn--ghost' : ''}"
	type="button"
	data-save-slug={slug}
	data-saved={saved}
	onclick={() => (saved ? unsave() : save())}
	disabled={busy}
>
	{#if busy}
		<span class="spinner" aria-hidden="true"></span>
		<span>Working</span>
	{:else if saved}
		<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
			<path
				d="M2 8.5 L6 12.5 L14 3.5"
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<span>Saved</span>
	{:else}
		<span>Save</span>
	{/if}
	<span class="visually-hidden">{saved ? `Remove ${slug} from saves` : `Save ${slug}`}</span>
</button>
