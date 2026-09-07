<script>
	// One shared modal shell for the bio, apply and enquiry modals.
	import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';

	export let open = false;
	export let title = '';
	export let labelledBy = 'modal-title';

	const dispatch = createEventDispatcher();
	let panel;
	let opener = null;

	function close() {
		dispatch('close');
	}

	function onKeydown(e) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}
		if (e.key !== 'Tab' || !panel) return;
		const focusables = panel.querySelectorAll(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		if (!focusables.length) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	$: if (typeof document !== 'undefined') {
		if (open) {
			if (!opener) opener = document.activeElement;
			document.body.style.overflow = 'hidden';
			tick().then(() => {
				const target = panel?.querySelector('[data-autofocus], button, a[href], input, textarea, select');
				target?.focus();
			});
		} else {
			document.body.style.overflow = '';
			if (opener && typeof opener.focus === 'function') opener.focus();
			opener = null;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', onKeydown, true);
	});
	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown, true);
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	});
</script>

{#if open}
	<div class="scrim" role="presentation" on:click={close}>
		<div
			class="panel"
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelledBy}
			bind:this={panel}
			on:click|stopPropagation
		>
			<div class="head">
				<h2 id={labelledBy}>{title}</h2>
				<button type="button" class="close" on:click={close}>
					<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
						<path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" stroke-width="2" fill="none" />
					</svg>
					<span class="visually-hidden">Close dialog</span>
				</button>
			</div>
			<div class="body"><slot /></div>
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(18, 17, 16, 0.55);
		z-index: 120;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		overflow-y: auto;
	}
	.panel {
		background: #fff;
		border-radius: var(--radius);
		border: 1px solid var(--rule);
		width: min(660px, 100%);
		max-height: 88vh;
		overflow-y: auto;
		box-shadow: 0 24px 60px rgba(13, 33, 69, 0.28);
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 22px 12px;
		border-bottom: 1px solid var(--rule);
		position: sticky;
		top: 0;
		background: #fff;
	}
	.head h2 {
		margin: 0;
		font-size: 1.3rem;
	}
	.close {
		background: transparent;
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
		min-width: 44px;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--ink);
	}
	.close:hover {
		background: var(--ground-soft);
		border-color: var(--rule-strong);
	}
	.body {
		padding: 20px 22px 24px;
	}
</style>
