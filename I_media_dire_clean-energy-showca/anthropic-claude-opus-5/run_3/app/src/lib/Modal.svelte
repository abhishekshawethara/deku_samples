<script>
	// One shell for the bio modal, the apply modal and the enquiry modal.
	// Escape closes, focus is trapped while open and returns to the control
	// that opened it.
	let { open = false, title = '', describedby = '', onclose, children } = $props();

	let dialog = $state(null);
	let opener = null;

	const FOCUSABLE =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	$effect(() => {
		if (open) {
			opener = document.activeElement;
			document.body.style.overflow = 'hidden';
			queueMicrotask(() => {
				const first = dialog?.querySelector(FOCUSABLE);
				(first || dialog)?.focus();
			});
		} else {
			document.body.style.overflow = '';
			if (opener && document.contains(opener)) opener.focus();
			opener = null;
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	function onkeydown(event) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			onclose?.();
			return;
		}
		if (event.key !== 'Tab' || !dialog) return;
		const items = [...dialog.querySelectorAll(FOCUSABLE)].filter(
			(el) => el.offsetParent !== null || el === document.activeElement
		);
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
</script>

{#if open}
	<div class="modal-layer">
		<button class="modal-scrim" type="button" onclick={() => onclose?.()} tabindex="-1">
			<span class="visually-hidden">Close this dialog</span>
		</button>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-label={title}
			aria-describedby={describedby || undefined}
			tabindex="-1"
			bind:this={dialog}
			{onkeydown}
		>
			<div class="modal__head">
				<h2 class="modal__title">{title}</h2>
				<button class="modal__x" type="button" onclick={() => onclose?.()}>
					<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
						<path
							d="M2 2 L14 14 M14 2 L2 14"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
					<span class="visually-hidden">Close</span>
				</button>
			</div>
			<div class="modal__body">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-layer {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		padding: 1rem;
	}
	.modal-scrim {
		position: absolute;
		inset: 0;
		border: 0;
		padding: 0;
		background: rgba(18, 18, 18, 0.55);
		backdrop-filter: blur(2px);
		cursor: pointer;
	}
	.modal {
		position: relative;
		width: min(640px, 100%);
		max-height: min(86vh, 780px);
		overflow: auto;
		background: var(--paper);
		border: var(--rule-w) solid var(--rule-strong);
		border-radius: var(--radius);
		box-shadow: 0 24px 60px rgba(11, 37, 69, 0.28);
	}
	.modal__head {
		position: sticky;
		top: 0;
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.1rem 1.25rem 0.8rem;
		background: var(--paper);
		border-bottom: var(--rule-w) solid var(--rule);
	}
	.modal__title {
		margin: 0;
		font-size: 1.25rem;
	}
	.modal__x {
		flex: none;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border: var(--rule-w) solid var(--rule);
		border-radius: var(--radius-sm);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
	}
	.modal__x:hover {
		background: var(--sky);
		color: var(--accent-hover);
		border-color: var(--accent);
	}
	.modal__x:active {
		background: var(--sky-2);
	}
	.modal__body {
		padding: 1.25rem;
	}
</style>
