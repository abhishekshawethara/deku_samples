<script>
	// Every "photograph" on this site, the industry plates, the team portraits
	// and the route grounds, is a generated gradient in the site's own tones.
	// Zero asset files: the seed string picks a deterministic variation.
	let {
		seed = 'plate',
		kind = 'industry',
		ratio = '16 / 9',
		label = '',
		initials = ''
	} = $props();

	function hash(s) {
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return Math.abs(h);
	}

	const h = $derived(hash(String(seed)));
	const angle = $derived(h % 140);
	const x1 = $derived(12 + (h % 55));
	const y1 = $derived(10 + ((h >> 3) % 60));
	const x2 = $derived(30 + ((h >> 5) % 60));
	const y2 = $derived(20 + ((h >> 7) % 65));
	const rot = $derived(((h >> 9) % 40) - 20);
</script>

<div
	class="plate-gen plate-gen--{kind}"
	style:aspect-ratio={ratio}
	style="--a:{angle}deg; --x1:{x1}%; --y1:{y1}%; --x2:{x2}%; --y2:{y2}%; --rot:{rot}deg;"
	role={label ? 'img' : 'presentation'}
	aria-label={label || undefined}
>
	<span class="plate-gen__band" aria-hidden="true"></span>
	{#if initials}
		<span class="plate-gen__initials" aria-hidden="true">{initials}</span>
	{/if}
</div>

<style>
	.plate-gen {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: var(--radius);
		background:
			radial-gradient(60% 70% at var(--x1) var(--y1), var(--sky-2), transparent 70%),
			radial-gradient(55% 65% at var(--x2) var(--y2), rgba(31, 111, 235, 0.22), transparent 72%),
			linear-gradient(var(--a), var(--sky) 0%, #ffffff 55%, var(--paper-3) 100%);
	}
	.plate-gen--portrait {
		background:
			radial-gradient(48% 40% at 50% 30%, rgba(255, 255, 255, 0.95), transparent 72%),
			radial-gradient(70% 60% at var(--x1) var(--y1), var(--sky-2), transparent 75%),
			linear-gradient(var(--a), var(--sky) 0%, #f7fbff 60%, var(--sky-2) 100%);
	}
	.plate-gen--dark {
		background:
			radial-gradient(60% 70% at var(--x1) var(--y1), rgba(31, 111, 235, 0.4), transparent 70%),
			linear-gradient(var(--a), var(--navy) 0%, #123055 60%, #081a33 100%);
	}
	.plate-gen__band {
		position: absolute;
		inset: -20%;
		background: repeating-linear-gradient(
			var(--rot),
			rgba(255, 255, 255, 0) 0 22px,
			rgba(255, 255, 255, 0.5) 22px 24px
		);
		opacity: 0.5;
		mask-image: radial-gradient(75% 75% at 50% 50%, #000 30%, transparent 78%);
	}
	.plate-gen__initials {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--font-head);
		font-size: clamp(1.6rem, 4vw, 2.6rem);
		color: var(--navy);
		opacity: 0.5;
		letter-spacing: 0.04em;
	}
</style>
