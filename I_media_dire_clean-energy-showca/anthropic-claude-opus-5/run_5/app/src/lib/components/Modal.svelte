
<script>
	/** One shell shared by the bio modal, the apply modal and the enquiry modal.
	 * Escape closes it and focus returns to the control that opened it; focus
	 * stays inside while it is open. */
	let { open = false, title = '', onclose, children, labelledby = 'zj-modal-title' } = $props();

	let dialog = $state(null);
	let opener = null;

	function focusables() {
		if (!dialog) return [];
		return [
			...dialog.querySelectorAll(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		].filter((el) => el.offsetParent !== null || el === document.activeElement);
	}

	function onkeydown(e) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onclose?.();
			return;
		}
		if (e.key !== 'Tab') return;
		const items = focusables();
		if (!items.length) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (open) {
			opener = document.activeElement;
			document.body.style.overflow = 'hidden';
			queueMicrotask(() => {
				const items = focusables();
				(items[0] || dialog)?.focus();
			});
		} else {
			document.body.style.overflow = '';
			if (opener && typeof opener.focus === 'function') opener.focus();
			opener = null;
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<div class="scrim">
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="catch" onclick={() => onclose?.()} aria-hidden="true"></div>
		<div
			class="panel"
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelledby}
			tabindex="-1"
			bind:this={dialog}
			onkeydown={onkeydown}
		>
			<div class="head">
				<h2 id={labelledby}>{title}</h2>
				<button class="close" type="button" onclick={() => onclose?.()}>
					<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
						<path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" stroke-width="2.2" fill="none" />
					</svg>
					<span class="visually-hidden">Close</span>
				</button>
			</div>
			<div class="body">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: var(--z-panel);
		display: grid;
		place-items: center;
		padding: 20px;
	}
	.catch {
		position: absolute;
		inset: 0;
		background: rgba(13, 12, 11, 0.55);
	}
	.panel {
		position: relative;
		background: var(--surface);
		border-radius: var(--radius-lg);
		border: var(--hair) solid var(--rule);
		width: min(620px, 100%);
		max-height: 88vh;
		overflow: auto;
		box-shadow: 0 20px 60px rgba(13, 12, 11, 0.28);
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 20px 22px 8px;
		position: sticky;
		top: 0;
		background: var(--surface);
	}
	.head h2 {
		font-size: 1.3rem;
		margin: 0;
	}
	.close {
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: 999px;
		border: var(--hair) solid var(--rule);
		background: var(--surface);
		color: var(--ink);
		display: grid;
		place-items: center;
		cursor: pointer;
	}
	.close:hover {
		background: var(--surface-sunk);
	}
	.close:active {
		background: var(--rule);
	}
	.body {
		padding: 6px 22px 24px;
	}
</style>
