<script>
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';

	export let open = false;
	export let title = '';
	export let describedBy = '';
	export let size = 'md';

	const dispatch = createEventDispatcher();
	let dialogEl;
	let opener = null;
	const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

	function close() {
		dispatch('close');
	}

	function onKeydown(e) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.stopPropagation();
			e.preventDefault();
			close();
			return;
		}
		if (e.key !== 'Tab' || !dialogEl) return;
		const nodes = dialogEl.querySelectorAll(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		const list = Array.from(nodes).filter((n) => n.offsetParent !== null || n === document.activeElement);
		if (!list.length) return;
		const first = list[0];
		const last = list[list.length - 1];
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
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	let wasOpen = false;
	$: if (open !== wasOpen) {
		if (open) {
			opener = typeof document !== 'undefined' ? document.activeElement : null;
			tick().then(() => {
				const target =
					dialogEl?.querySelector('[data-autofocus]') ||
					dialogEl?.querySelector(
						'a[href], button:not([disabled]), input:not([disabled]), select, textarea'
					) ||
					dialogEl;
				target?.focus?.();
			});
		} else if (wasOpen) {
			opener?.focus?.();
			opener = null;
		}
		wasOpen = open;
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
	<div class="overlay">
		<button class="scrim" type="button" aria-label="Close dialogue" on:click={close}></button>
		<div
			class="dialog {size}"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			aria-describedby={describedBy || null}
			bind:this={dialogEl}
			tabindex="-1"
		>
			<div class="head">
				<h2 id={titleId}>{title}</h2>
				<button class="x" type="button" on:click={close}>
					<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
						<path
							d="M3 3 L13 13 M13 3 L3 13"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
					<span class="sr-only">Close</span>
				</button>
			</div>
			<div class="body">
				<slot />
			</div>
			{#if $$slots.footer}
				<div class="foot"><slot name="footer" /></div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-panel);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}
	.scrim {
		position: absolute;
		inset: 0;
		background: rgba(13, 16, 20, 0.55);
		border: 0;
		padding: 0;
		cursor: pointer;
	}
	.dialog {
		position: relative;
		background: var(--paper);
		border-radius: var(--r-xl);
		border: 1px solid var(--rule-strong);
		width: 100%;
		max-width: 560px;
		max-height: min(88vh, 780px);
		display: flex;
		flex-direction: column;
		box-shadow: 0 24px 60px rgba(13, 16, 20, 0.24);
	}
	.dialog.lg {
		max-width: 760px;
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 22px 12px;
		border-bottom: 1px solid var(--rule);
	}
	.head h2 {
		margin: 0;
		font-size: 1.3rem;
	}
	.x {
		flex: none;
		width: 40px;
		height: 40px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--rule-strong);
		border-radius: var(--r-md);
		background: var(--paper);
		cursor: pointer;
		color: var(--ink);
	}
	.x:hover {
		background: var(--paper-3);
	}
	.body {
		padding: 20px 22px;
		overflow-y: auto;
	}
	.foot {
		padding: 14px 22px 20px;
		border-top: 1px solid var(--rule);
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		flex-wrap: wrap;
	}
</style>
