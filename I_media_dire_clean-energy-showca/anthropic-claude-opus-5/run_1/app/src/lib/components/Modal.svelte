<script>
	// One shell for the bio modal, the apply modal and the enquiry modal.
	// Escape closes it, focus is trapped inside, and focus returns to the
	// control that opened it.
	let { open = false, title = '', onclose, children, footer } = $props();

	let dialog = $state(null);
	let opener = null;
	let titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

	function focusables() {
		if (!dialog) return [];
		return [
			...dialog.querySelectorAll(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		].filter((el) => el.offsetParent !== null || el === document.activeElement);
	}

	function close() {
		onclose?.();
	}

	function onkeydown(event) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			event.preventDefault();
			close();
			return;
		}
		if (event.key !== 'Tab') return;
		const items = focusables();
		if (!items.length) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
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
			if (opener && typeof opener.focus === 'function') {
				const el = opener;
				opener = null;
				queueMicrotask(() => el.focus());
			}
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<div class="scrim">
		<button class="scrim-hit" type="button" onclick={close} tabindex="-1" aria-hidden="true"
		></button>
		<div
			class="panel"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			bind:this={dialog}
			tabindex="-1"
			onkeydown={onkeydown}
		>
			<header class="head">
				<h2 id={titleId}>{title}</h2>
				<button class="x" type="button" onclick={close}>
					<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
						<path
							d="M4 4 L16 16 M16 4 L4 16"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							fill="none"
						/>
					</svg>
					<span class="visually-hidden">Close</span>
				</button>
			</header>
			<div class="body">
				{@render children?.()}
			</div>
			{#if footer}
				<footer class="foot">{@render footer()}</footer>
			{/if}
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 400;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(16, 15, 14, 0.55);
	}
	.scrim-hit {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: default;
	}
	.panel {
		position: relative;
		width: min(640px, 100%);
		max-height: min(86vh, 780px);
		overflow: auto;
		background: var(--surface);
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius);
		box-shadow: 0 20px 50px rgba(16, 15, 14, 0.28);
	}
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 20px 12px;
		border-bottom: 1px solid var(--rule);
		position: sticky;
		top: 0;
		background: var(--surface);
	}
	.head h2 {
		margin: 0;
		font-size: 1.25rem;
	}
	.x {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--rule);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
	}
	.x:hover {
		background: var(--surface-grey);
	}
	.body {
		padding: 18px 20px;
	}
	.foot {
		padding: 14px 20px 18px;
		border-top: 1px solid var(--rule);
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		flex-wrap: wrap;
	}
</style>
