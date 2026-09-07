<script>
	import '../app.css';
	import { page, navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { account, token, authReady, loadAccount, signOut } from '$lib/session.js';

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
	let scrolled = $state(false);
	let booted = $state(false);
	let loadPct = $state(0);
	let menuPanel = $state(null);
	let menuButton = $state(null);

	const currentPath = $derived($page.url.pathname);

	onMount(() => {
		loadAccount();

		// The cover's counter reflects the real download rather than a guess.
		const tick = () => {
			const entries = performance.getEntriesByType('resource');
			const done = entries.filter((e) => e.responseEnd > 0).length;
			const total = Math.max(done, entries.length, 1);
			const docReady = document.readyState === 'complete' ? 1 : 0.6;
			loadPct = Math.min(100, Math.round(((done / total) * 0.6 + docReady * 0.4) * 100));
		};
		tick();
		const iv = setInterval(tick, 90);
		const finish = () => {
			loadPct = 100;
			clearInterval(iv);
			requestAnimationFrame(() => (booted = true));
		};
		if (document.readyState === 'complete') setTimeout(finish, 120);
		else window.addEventListener('load', () => setTimeout(finish, 120), { once: true });
		const failsafe = setTimeout(finish, 2500);

		const onScroll = () => (scrolled = window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			clearInterval(iv);
			clearTimeout(failsafe);
			window.removeEventListener('scroll', onScroll);
		};
	});

	$effect(() => {
		// closing the panel on a route change
		currentPath;
		menuOpen = false;
	});

	function onMenuKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			menuOpen = false;
			menuButton?.focus();
			return;
		}
		if (event.key !== 'Tab' || !menuPanel) return;
		const items = [...menuPanel.querySelectorAll('a, button')];
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
		if (menuOpen && menuPanel) {
			queueMicrotask(() => menuPanel.querySelector('a, button')?.focus());
		}
	});
</script>

<svelte:head>
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

{#if !booted}
	<div class="boot" aria-live="polite">
		<div class="boot-inner">
			<Logo size={30} />
			<p class="boot-count mono">{loadPct}%</p>
			<p class="boot-note muted">Preparing the reactor</p>
		</div>
	</div>
{/if}

{#if $navigating}
	<div class="sweep" aria-hidden="true"></div>
	<p class="visually-hidden" aria-live="polite">Loading the next page</p>
{/if}

<header class="bar" class:grounded={scrolled}>
	<div class="bar-inner">
		<a class="brand" href="/" aria-label="Zettajoule, home"><Logo /></a>

		<nav class="routes" aria-label="Main">
			<ul>
				{#each ROUTES as r}
					<li>
						<a href={r.href} aria-current={currentPath === r.href ? 'page' : undefined}>{r.label}</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="bar-actions">
			{#if $authReady && $account}
				<a class="acct" href="/account">{$account.display_name}</a>
				<button class="btn btn-quiet btn-sm" type="button" onclick={signOut}>Sign out</button>
			{:else if $authReady}
				<a class="acct" href="/signin">Sign in</a>
			{/if}
			<a class="btn btn-primary btn-sm touch" href="/contact">Get in Touch</a>
			<button
				class="menu-btn"
				type="button"
				bind:this={menuButton}
				aria-expanded={menuOpen}
				aria-controls="route-panel"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
					<path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" fill="none" />
				</svg>
				<span class="visually-hidden">Open the route menu</span>
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
		aria-label="Route menu"
		tabindex="-1"
		bind:this={menuPanel}
		onkeydown={onMenuKeydown}
	>
		<div class="panel-head">
			<Logo />
			<button class="menu-btn" type="button" onclick={() => { menuOpen = false; menuButton?.focus(); }}>
				<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
					<path
						d="M4 4 L16 16 M16 4 L4 16"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						fill="none"
					/>
				</svg>
				<span class="visually-hidden">Close the route menu</span>
			</button>
		</div>
		<nav aria-label="All routes">
			<ul class="panel-list">
				{#each ROUTES as r}
					<li><a href={r.href}>{r.label}</a></li>
				{/each}
				<li><a href="/calculator">Calculator</a></li>
				<li><a href="/compare">Compare</a></li>
				<li><a href="/faq">FAQ</a></li>
				<li><a href="/account">Account</a></li>
			</ul>
		</nav>
	</div>
{/if}

<main id="main" tabindex="-1">
	{@render children?.()}
</main>

<section class="cta">
	<div class="wrap cta-inner">
		<div>
			<h2>Tell us what you need to power</h2>
			<p class="lede">
				Heat, hydrogen or firm electricity, at your temperature and on your fence line. We own and
				run the module; you buy the energy.
			</p>
		</div>
		<a class="btn btn-primary" href="/contact">Get in Touch</a>
	</div>
</section>

<footer class="foot">
	<div class="wrap">
		<div class="foot-top">
			<div class="foot-brand">
				<Logo inverse />
				<p>Small high-temperature reactor modules, owned, operated and staffed by us.</p>
			</div>
			<nav aria-label="Footer">
				<ul class="foot-routes">
					{#each ROUTES as r}
						<li><a href={r.href}>{r.label}</a></li>
					{/each}
					<li><a href="/calculator">Calculator</a></li>
					<li><a href="/faq">FAQ</a></li>
					<li><a href="/account">Account</a></li>
				</ul>
			</nav>
			<div class="foot-social">
				<p class="foot-label">Elsewhere</p>
				<ul>
					<li>
						<a href="/contact" aria-label="Professional network">
							<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
								<rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" />
								<path d="M5.5 8v7M5.5 5.2v.1M9.5 15V8m0 3c0-2 4.5-2.4 4.5.6V15" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" />
							</svg>
							<span>Professional network</span>
						</a>
					</li>
					<li>
						<a href="/news" aria-label="Newsroom feed">
							<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
								<rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" />
								<path d="M5 14a1 1 0 100-2 1 1 0 000 2M5 10.5c2 0 3.5 1.5 3.5 3.5M5 7c4 0 7 3 7 7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" />
							</svg>
							<span>Newsroom feed</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
		<div class="foot-legal">
			<p>&copy; {new Date().getFullYear()} Zettajoule. All rights reserved.</p>
			<p>
				Names, portraits and stories on this site are stand-ins; every mark and plate is drawn from
				code and no asset file is shipped.
			</p>
		</div>
	</div>
</footer>

<style>
	.boot {
		position: fixed;
		inset: 0;
		z-index: 600;
		background: #ffffff;
		display: grid;
		place-items: center;
	}
	.boot-inner {
		text-align: center;
	}
	.boot-count {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 2.4rem;
		margin: 18px 0 4px;
	}
	.boot-note {
		font-size: 0.85rem;
		margin: 0;
	}

	/* chrome exemption 1 of 2: the cover that sweeps across on a route change */
	.sweep {
		position: fixed;
		inset: 0;
		z-index: 500;
		background: var(--surface);
		transform-origin: left center;
		animation: zj-sweep 520ms ease-in-out forwards;
		pointer-events: none;
	}
	@keyframes zj-sweep {
		0% {
			transform: scaleX(0);
		}
		45% {
			transform: scaleX(1);
			transform-origin: left center;
		}
		55% {
			transform: scaleX(1);
			transform-origin: right center;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right center;
		}
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: 300;
		background: transparent;
		border-bottom: 1px solid transparent;
	}
	.bar.grounded {
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(8px);
		border-bottom-color: var(--rule);
	}
	.bar-inner {
		max-width: var(--maxw);
		margin: 0 auto;
		padding: 0 24px;
		height: var(--bar-h);
		display: flex;
		align-items: center;
		gap: 18px;
	}
	.brand {
		text-decoration: none;
		flex: none;
	}
	.routes {
		flex: 1 1 auto;
		min-width: 0;
	}
	.routes ul {
		display: flex;
		gap: 4px;
		list-style: none;
		margin: 0;
		padding: 0;
		justify-content: center;
		flex-wrap: nowrap;
	}
	.routes a {
		display: inline-block;
		padding: 8px 9px;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}
	.routes a:hover {
		color: var(--accent-hover);
		background: var(--surface-soft);
	}
	.routes a[aria-current='page'] {
		color: var(--accent);
		box-shadow: inset 0 -2px 0 var(--accent);
	}
	.bar-actions {
		flex: none;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.acct {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
		max-width: 130px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.acct:hover {
		color: var(--accent-hover);
	}
	.menu-btn {
		display: none;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
	}
	.menu-btn:hover {
		background: var(--surface-grey);
	}

	.panel {
		position: fixed;
		inset: 0;
		z-index: 350;
		background: var(--surface);
		padding: 16px 24px 40px;
		overflow: auto;
	}
	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--bar-h);
	}
	.panel-head .menu-btn {
		display: inline-flex;
	}
	.panel-list {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
	}
	.panel-list li {
		border-top: 1px solid var(--rule);
	}
	.panel-list a {
		display: block;
		padding: 15px 2px;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.35rem;
		color: var(--ink);
		text-decoration: none;
	}
	.panel-list a:hover {
		color: var(--accent-hover);
	}

	main {
		display: block;
		min-height: 40vh;
	}
	main:focus {
		outline: none;
	}

	.cta {
		background: var(--surface-soft);
		border-top: 1px solid var(--rule);
		padding: 56px 0;
	}
	.cta-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
		flex-wrap: wrap;
	}
	.cta h2 {
		margin-bottom: 8px;
	}
	.cta p {
		margin: 0;
	}

	.foot {
		background: var(--navy);
		color: #dbe4f2;
		padding: 52px 0 30px;
	}
	.foot a {
		color: #cddcf5;
		text-decoration: none;
		font-size: 0.9rem;
	}
	.foot a:hover {
		color: #ffffff;
		text-decoration: underline;
	}
	.foot-top {
		display: grid;
		grid-template-columns: 1.4fr 1.6fr 0.9fr;
		gap: 32px;
	}
	.foot-brand p {
		margin: 14px 0 0;
		font-size: 0.9rem;
		color: #a9b8d2;
		max-width: 34ch;
	}
	.foot-routes {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 8px 16px;
	}
	.foot-label {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #8ba0c4;
		margin: 0 0 10px;
	}
	.foot-social ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.foot-social a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.foot-legal {
		margin-top: 34px;
		padding-top: 18px;
		border-top: 1px solid rgba(255, 255, 255, 0.16);
		font-size: 0.82rem;
		color: #93a5c2;
	}
	.foot-legal p {
		margin: 0 0 4px;
	}

	@media (max-width: 1080px) {
		.routes a {
			padding: 8px 6px;
			font-size: 0.78rem;
		}
	}
	@media (max-width: 900px) {
		.routes {
			display: none;
		}
		.menu-btn {
			display: inline-flex;
		}
		.acct {
			display: none;
		}
		.bar-actions .btn-quiet {
			display: none;
		}
		.bar-inner {
			justify-content: space-between;
		}
	}
	@media (max-width: 520px) {
		.touch {
			display: none;
		}
		.foot-top {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 860px) {
		.foot-top {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
