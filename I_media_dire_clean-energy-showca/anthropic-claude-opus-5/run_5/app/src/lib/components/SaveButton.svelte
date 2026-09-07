
<script>
	import { browser } from '$app/environment';
	import { apiData, getToken, getSaveToken, setSaveToken } from '$lib/api';

	/** A card can be saved before there is an account to save it to. */
	let { slug, title = 'this solution', onsaved } = $props();

	let saved = $state(false);
	let savedId = $state(null);
	let busy = $state(false);
	let message = $state(null);

	async function refresh() {
		if (!browser) return;
		const token = getToken();
		const st = getSaveToken();
		if (!token && !st) {
			saved = false;
			savedId = null;
			return;
		}
		try {
			const rows = await apiData(`/saves${!token && st ? `?save_token=${encodeURIComponent(st)}` : ''}`);
			const hit = (rows || []).find((r) => r.slug === slug);
			saved = !!hit;
			savedId = hit?.id ?? null;
		} catch {
			saved = false;
			savedId = null;
		}
	}

	$effect(() => {
		void slug;
		refresh();
		if (!browser) return;
		const on = () => refresh();
		window.addEventListener('zj:saves', on);
		window.addEventListener('zj:session', on);
		return () => {
			window.removeEventListener('zj:saves', on);
			window.removeEventListener('zj:session', on);
		};
	});

	async function toggle() {
		busy = true;
		message = null;
		try {
			if (saved && savedId != null) {
				const token = getToken();
				const st = getSaveToken();
				await apiData(
					`/saves/${savedId}${!token && st ? `?save_token=${encodeURIComponent(st)}` : ''}`,
					{ method: 'DELETE' }
				);
				saved = false;
				savedId = null;
				message = { kind: 'ok', text: `${title} removed from your saves.` };
			} else {
				const body = { solution_slug: slug };
				const st = getSaveToken();
				if (!getToken() && st) body.save_token = st;
				const row = await apiData('/saves', { method: 'POST', body });
				if (row?.save_token) setSaveToken(row.save_token);
				saved = true;
				savedId = row.id;
				message = {
					kind: 'ok',
					text: getToken()
						? `${title} saved to your account.`
						: `${title} saved. Sign in and it follows you in.`
				};
			}
			if (browser) window.dispatchEvent(new CustomEvent('zj:saves'));
			onsaved?.();
		} catch (err) {
			message = { kind: 'fail', text: err.message || 'That save could not be recorded.' };
		} finally {
			busy = false;
		}
	}
</script>

<div class="save-wrap">
	<button
		class="btn btn-sm"
		class:btn-quiet={!saved}
		class:btn-secondary={saved}
		type="button"
		onclick={toggle}
		disabled={busy}
		aria-pressed={saved}
		data-testid="save-{slug}"
	>
		{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
		{#if saved}
			<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
				<path d="M3 8.5 L6.4 12 L13 4.6" stroke="currentColor" stroke-width="2.1" fill="none" />
			</svg>
			Saved
		{:else}
			Save
		{/if}
		<span class="visually-hidden">{title}</span>
	</button>
	{#if message}
		<p class="note" class:fail={message.kind === 'fail'} role="status">{message.text}</p>
	{/if}
</div>

<style>
	.save-wrap {
		display: contents;
	}
	.note {
		font-size: 0.76rem;
		margin: 6px 0 0;
		color: var(--ok);
		flex-basis: 100%;
	}
	.note.fail {
		color: var(--fail);
	}
</style>
