<script>
	/* One shell for the bio, apply and enquiry modals.
	   Escape closes, focus is trapped inside, focus returns to the opener. */
	import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';

	export let open = false;
	export let title = '';
	export let labelledBy = 'zj-modal-title';

	const dispatch = createEventDispatcher();
	let dialogEl;
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
		if (e.key !== 'Tab' || !dialogEl) return;
		const focusables = dialogEl.querySelectorAll(
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

	async function onOpen() {
		opener = document.activeElement;
		await tick();
		const target = dialogEl?.querySelector('[data-autofocus]') || dialogEl?.querySelector('button, input, textarea, select, a[href]');
		target?.focus();
		document.body.style.overflow = 'hidden';
	}

	function onClose() {
		document.body.style.overflow = '';
		if (opener && typeof opener.focus === 'function') opener.focus();
		opener = null;
	}

	let wasOpen = false;
	$: if (typeof document !== 'undefined') {
		if (open && !wasOpen) {
			wasOpen = true;
			onOpen();
		} else if (!open && wasOpen) {
			wasOpen = false;
			onClose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', onKeydown, true);
	});
	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown, true);
		if (typeof document !== 'undefined' && wasOpen) document.body.style.overflow = '';
	});
</script>

{#if open}
	<div class="scrim" role="presentation" on:click={close}>
		<div
			class="dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelledBy}
			bind:this={dialogEl}
			on:click|stopPropagation
		>
			<div class="dialog__head">
				<h2 id={labelledBy}>{title}</h2>
				<button class="close" type="button" on:click={close}>
					<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
						<path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
					</svg>
					<span class="visually-hidden">Close dialog</span>
				</button>
			</div>
			<div class="dialog__body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(16, 17, 18, 0.55);
		z-index: var(--z-panel);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		overflow-y: auto;
	}
	.dialog {
		background: var(--paper);
		border-radius: var(--radius);
		border: 1px solid var(--rule-strong);
		width: min(560px, 100%);
		max-height: 90vh;
		overflow-y: auto;
	}
	.dialog__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.1rem;
		border-bottom: 1px solid var(--rule);
		position: sticky;
		top: 0;
		background: var(--paper);
	}
	.dialog__head h2 {
		margin: 0;
		font-size: 1.15rem;
	}
	.dialog__body {
		padding: 1.1rem;
	}
	.close {
		background: transparent;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		color: var(--ink);
		width: 40px;
		height: 40px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex: none;
	}
	.close:hover {
		background: var(--paper-grey);
	}
	.close:active {
		background: var(--rule);
	}
</style>
