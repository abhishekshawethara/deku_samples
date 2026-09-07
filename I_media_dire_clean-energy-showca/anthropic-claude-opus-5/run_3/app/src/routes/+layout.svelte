<script>
	import '../app.css';
	import { page, navigating } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Logo from '$lib/Logo.svelte';
	import { isSignedIn, account, signOutTo } from '$lib/auth.js';
	import { scrollY } from '$lib/scroll.js';

	let { children } = $props();

	const ROUTES = [
		{ href: '/company', label: 'Company' },
		{ href: '/technology', label: 'Technology' },
		{ href: '/solutions', label: 'Solutions' },
		{ href: '/edge', label: 'Our Edge' },
		{ href: '/team', label: 'Our Team' },
		{ href: '/investors', label: 'Investors' },
		{ href: '/news', label: 'News' },
		{ href: '/careers', label: 'Careers' },
		{ href: '/contact', label: 'Contact' }
	];

	let menuOpen = $state(false);
	let menuButton = $state(null);
	let booted = $state(false);
	let bootPercent = $state(0);

	const scrolled = $derived($scrollY > 8);
	const path = $derived($page.url.pathname);

	// The first-load cover: its counter reflects the real download rather than a
	// guess, then it lifts once the document has finished loading.
	$effect(() => {
		if (!browser) return;
		let raf;
		const tick = () => {
			const entries = performance.getEntriesByType('resource');
			const done = entries.filter((e) => e.responseEnd > 0).length;
			const total = Math.max(done, entries.length, 1);
			const readyBonus = document.readyState === 'complete' ? 1 : 0.85;
			bootPercent = Math.min(100, Math.round((done / total) * 100 * readyBonus));
			if (document.readyState === 'complete') {
				bootPercent = 100;
				setTimeout(() => (booted = true), 90);
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		tick();
		window.addEventListener('load', tick, { once: true });
		const failsafe = setTimeout(() => (booted = true), 4000);
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(failsafe);
		};
	});

	$effect(() => {
		// close the panel on any route change and restore focus to its button
		path;
		if (menuOpen) {
			menuOpen = false;
			menuButton?.focus();
		}
	});

	function onPanelKeydown(event) {
		if (event.key === 'Escape') {
			menuOpen = false;
			menuButton?.focus();
		}
	}

	function signOut() {
		signOutTo(goto);
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && menuOpen) {
			menuOpen = false;
			menuButton?.focus();
		}
	}}
/>

<a class="skip-link" href="#main">Skip to content</a>

{#if !booted}
	<!-- plain white cover, waits until the reactor is ready to draw -->
	<div class="boot" aria-live="polite" aria-label="Loading Zettajoule">
		<Logo size={34} />
		<p class="boot__count">{bootPercent}%</p>
		<div class="boot__bar"><span style:width={`${bootPercent}%`}></span></div>
	</div>
{/if}

{#if $navigating}
	<!-- chrome exemption: the cover that sweeps across on a route change -->
	<div class="sweep" aria-hidden="true"></div>
	<p class="visually-hidden" role="status">Loading page</p>
{/if}

<header class="bar" class:bar--scrolled={scrolled}>
	<div class="bar__inner">
		<a class="bar__logo" href="/" aria-label="Zettajoule, home"><Logo size={24} /></a>

		<nav class="bar__nav" aria-label="Main">
			<ul>
				{#each ROUTES as r}
					<li>
						<a href={r.href} aria-current={path === r.href ? 'page' : undefined}>{r.label}</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="bar__end">
			<a class="bar__account" href="/account">
				{$isSignedIn ? 'Account' : 'Sign in'}
			</a>
			<a class="btn btn--sm bar__cta" href="/contact">Get in Touch</a>
			<button
				class="bar__menu"
				type="button"
				bind:this={menuButton}
				aria-expanded={menuOpen}
				aria-controls="route-panel"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" focusable="false">
					<path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" stroke-width="2" />
				</svg>
				<span class="visually-hidden">Menu</span>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<div
		class="panel"
		id="route-panel"
		role="dialog"
		aria-modal="true"
		aria-label="Routes"
		onkeydown={onPanelKeydown}
	>
		<div class="panel__head">
			<Logo size={24} />
			<button class="panel__x" type="button" onclick={() => (menuOpen = false)}>
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
					<path
						d="M2 2 L14 14 M14 2 L2 14"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
				<span class="visually-hidden">Close menu</span>
			</button>
		</div>
		<nav aria-label="Routes">
			<ul class="panel__list">
				{#each ROUTES as r}
					<li><a href={r.href} aria-current={path === r.href ? 'page' : undefined}>{r.label}</a></li>
				{/each}
				<li><a href="/account">{$isSignedIn ? 'Account' : 'Sign in'}</a></li>
				<li><a href="/calculator">Calculator</a></li>
				<li><a href="/faq">FAQ</a></li>
			</ul>
		</nav>
		<a class="btn btn--block" href="/contact">Get in Touch</a>
	</div>
{/if}

<main id="main" tabindex="-1">
	{@render children?.()}
</main>

<section class="invite">
	<div class="wrap invite__inner">
		<div>
			<p class="eyebrow">Get in touch</p>
			<h2 class="invite__head">Tell us what your site needs.</h2>
			<p class="muted">
				Careers, investor and supplier enquiries all reach the same place, and every one gets a
				reference back.
			</p>
		</div>
		<div class="row">
			<a class="btn" href="/contact">Get in Touch</a>
			<a class="btn btn--ghost" href="/calculator">Size a site</a>
		</div>
	</div>
</section>

<footer class="foot">
	<div class="wrap foot__inner">
		<div class="foot__brand">
			<Logo size={26} tone="light" />
			<p>Small modular high-temperature reactors. We sell the energy, not the reactor.</p>
			{#if $isSignedIn && $account}
				<p class="foot__who">
					Signed in as {$account.display_name}
					<button class="foot__signout" type="button" onclick={signOut}>Sign out</button>
				</p>
			{/if}
		</div>
		<nav class="foot__nav" aria-label="Footer">
			<ul>
				{#each ROUTES as r}
					<li><a href={r.href}>{r.label}</a></li>
				{/each}
				<li><a href="/calculator">Calculator</a></li>
				<li><a href="/compare">Compare</a></li>
				<li><a href="/faq">FAQ</a></li>
				<li><a href="/account">Account</a></li>
			</ul>
		</nav>
		<div class="foot__social">
			<p class="eyebrow" style="color:#9fb6d4">Elsewhere</p>
			<ul>
				{#each [['in', 'LinkedIn'], ['x', 'X'], ['yt', 'YouTube']] as [mark, name]}
					<li>
						<a href="/contact" aria-label={name}>
							<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
								<rect
									x="1"
									y="1"
									width="18"
									height="18"
									rx="4"
									fill="none"
									stroke="currentColor"
									stroke-width="1.4"
								/>
								<text
									x="10"
									y="14"
									text-anchor="middle"
									font-size="8"
									font-family="var(--font-head)"
									fill="currentColor">{mark}</text
								>
							</svg>
							<span class="visually-hidden">{name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="wrap foot__legal">
		<p>© 2026 Zettajoule. All rights reserved.</p>
		<p>Privacy notice · Terms of use · Cookie notice</p>
	</div>
</footer>

<style>
	.boot {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: #fff;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.75rem;
	}
	.boot__count {
		font-family: var(--font-head);
		font-size: 2rem;
		margin: 0;
	}
	.boot__bar {
		width: min(260px, 60vw);
		height: 3px;
		background: var(--paper-3);
	}
	.boot__bar span {
		display: block;
		height: 100%;
		background: var(--accent);
	}

	/* chrome exemption 2 of 2 */
	.sweep {
		position: fixed;
		inset: 0;
		z-index: 90;
		background: var(--paper);
		transform-origin: left;
		animation: sweep 520ms ease-in-out;
		pointer-events: none;
	}
	@keyframes sweep {
		0% {
			transform: scaleX(0);
			transform-origin: left;
		}
		50% {
			transform: scaleX(1);
			transform-origin: left;
		}
		51% {
			transform: scaleX(1);
			transform-origin: right;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right;
		}
	}

	.bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 70;
		height: var(--bar-h);
		background: transparent;
		border-bottom: 1px solid transparent;
	}
	.bar--scrolled {
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(10px);
		border-bottom-color: var(--rule);
	}
	.bar__inner {
		height: 100%;
		max-width: var(--maxw);
		margin: 0 auto;
		padding-inline: var(--pad-page);
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.bar__logo {
		text-decoration: none;
		flex: none;
	}
	.bar__nav {
		flex: 1;
		min-width: 0;
	}
	.bar__nav ul {
		display: flex;
		gap: clamp(0.5rem, 1.3vw, 1.15rem);
		list-style: none;
		margin: 0;
		padding: 0;
		justify-content: center;
	}
	.bar__nav a {
		display: inline-block;
		padding: 0.4rem 0.15rem;
		color: var(--ink);
		text-decoration: none;
		font-size: 0.86rem;
		font-weight: 500;
		white-space: nowrap;
		border-bottom: 2px solid transparent;
	}
	.bar__nav a:hover {
		color: var(--accent-hover);
		border-bottom-color: var(--accent);
	}
	.bar__nav a[aria-current='page'] {
		border-bottom-color: var(--ink);
		font-weight: 700;
	}
	.bar__end {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: none;
	}
	.bar__account {
		color: var(--ink);
		text-decoration: none;
		font-size: 0.86rem;
		font-weight: 500;
		padding: 0.4rem 0.3rem;
	}
	.bar__account:hover {
		color: var(--accent-hover);
	}
	.bar__menu {
		display: none;
		width: 44px;
		height: 44px;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		color: var(--ink);
		cursor: pointer;
	}
	.bar__menu:hover {
		background: var(--sky);
		border-color: var(--accent);
		color: var(--accent-hover);
	}

	.panel {
		position: fixed;
		inset: 0;
		z-index: 85;
		background: var(--paper);
		padding: 1rem var(--pad-page) 2rem;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.panel__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--bar-h);
	}
	.panel__x {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		background: transparent;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		color: var(--ink);
		cursor: pointer;
	}
	.panel__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.15rem;
	}
	.panel__list a {
		display: block;
		padding: 0.8rem 0.2rem;
		font-family: var(--font-head);
		font-size: 1.35rem;
		color: var(--ink);
		text-decoration: none;
		border-bottom: 1px solid var(--rule);
	}
	.panel__list a:hover,
	.panel__list a[aria-current='page'] {
		color: var(--accent-hover);
	}

	main {
		outline: none;
		min-height: 40vh;
	}

	.invite {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
	}
	.invite__inner {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: center;
		justify-content: space-between;
		padding-block: clamp(2.5rem, 5vw, 4rem);
	}
	.invite__head {
		margin-bottom: 0.5rem;
	}

	.foot {
		background: var(--navy);
		color: #dbe6f4;
		padding-block: 2.5rem 1.5rem;
	}
	.foot a {
		color: #dbe6f4;
		text-decoration: none;
	}
	.foot a:hover {
		color: #fff;
		text-decoration: underline;
	}
	.foot__inner {
		display: grid;
		grid-template-columns: 1.4fr 1.4fr 0.6fr;
		gap: 2rem;
	}
	.foot__brand p {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
		color: #b9cbe2;
		max-width: 36ch;
	}
	.foot__who {
		font-size: 0.85rem;
	}
	.foot__signout {
		background: none;
		border: 0;
		border-bottom: 1px solid currentColor;
		color: #dbe6f4;
		font: inherit;
		cursor: pointer;
		padding: 0 0 1px;
		margin-left: 0.5rem;
	}
	.foot__signout:hover {
		color: #fff;
	}
	.foot__nav ul,
	.foot__social ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.foot__nav ul {
		columns: 2;
		font-size: 0.9rem;
	}
	.foot__nav li {
		margin-bottom: 0.4rem;
	}
	.foot__social ul {
		display: flex;
		gap: 0.5rem;
	}
	.foot__social a {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
	}
	.foot__legal {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		justify-content: space-between;
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(219, 230, 244, 0.22);
		font-size: 0.8rem;
		color: #a9bdd6;
	}
	.foot__legal p {
		margin: 0;
	}

	@media (max-width: 1080px) {
		.bar__nav {
			display: none;
		}
		.bar__menu {
			display: inline-flex;
		}
		.bar__end {
			margin-left: auto;
		}
	}
	@media (max-width: 640px) {
		.bar__cta,
		.bar__account {
			display: none;
		}
		.foot__inner {
			grid-template-columns: 1fr;
		}
	}
</style>
