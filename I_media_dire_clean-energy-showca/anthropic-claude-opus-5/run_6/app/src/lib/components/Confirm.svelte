<script>
	import Modal from './Modal.svelte';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let title = 'Are you sure?';
	export let body = 'This cannot be undone.';
	export let confirmLabel = 'Confirm';
	export let busy = false;

	const dispatch = createEventDispatcher();
</script>

<Modal {open} {title} on:close={() => dispatch('cancel')}>
	<p>{body}</p>
	<svelte:fragment slot="footer">
		<button class="btn" type="button" on:click={() => dispatch('cancel')} data-autofocus>Cancel</button>
		<button class="btn btn-danger" type="button" disabled={busy} on:click={() => dispatch('confirm')}>
			{#if busy}<span class="spinner" aria-hidden="true"></span>{/if}
			{confirmLabel}
		</button>
	</svelte:fragment>
</Modal>
