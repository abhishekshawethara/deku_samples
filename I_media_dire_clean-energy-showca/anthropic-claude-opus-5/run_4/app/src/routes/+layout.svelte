<script>
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { page, navigating } from '$app/stores';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { account, loadSession, sessionReady } from '$lib/session.js';
	import { signOut } from '$lib/session.js';

	const NAV = [
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

	let menuOpen = false;
	let scrolled = false;
	let booting = true;
	let menuPanel;
	let menuButton;

	function onScroll() {
		scrolled = window.scrollY > 8;
	}

	function closeMenu() {
		menuOpen = false;
		menuButton?.focus();
	}

	function onKeydown(e) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
		if (e.key === 'Tab' && menuOpen && menuPanel) {
			const f = menuPanel.querySelectorAll('a[href], button:not([disabled])');
			if (!f.length) return;
			const first = f[0];
			const last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	$: if (browser && $page.url.pathname) menuOpen = false;

	onMount(async () => {
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('keydown', onKeydown);
		await loadSession();
		booting = false;
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('keydown', onKeydown);
	});

	$: year = new Date().getFullYear();
</script>

<a class="skip-link" href="#main">Skip to main content</a>

{#if booting}
	<div class="boot" aria-hidden="true"><span class="boot__mark"><Logo size={34} /></span></div>
{/if}

{#if $navigating}
	<div class="sweep" aria-hidden="true"></div>
	<span class="visually-hidden" role="status" aria-live="polite">Loading page</span>
{/if}

<header class="bar" class:bar--scrolled={scrolled}>
	<div class="bar__inner">
		<a class="bar__logo" href="/" aria-label="Zettajoule, home"><Logo size={26} /></a>

		<nav class="bar__nav" aria-label="Main">
			<ul>
				{#each NAV as item}
					<li>
						<a
							href={item.href}
							aria-current={$page.url.pathname === item.href ? 'page' : undefined}
							class:active={$page.url.pathname === item.href}>{item.label}</a
						>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="bar__actions">
			{#if $sessionReady && $account}
				<a class="bar__account" href="/account">{$account.display_name}</a>
				<button class="btn btn--ghost btn--small" type="button" on:click={signOut}>Sign out</button>
			{:else if $sessionReady}
				<a class="bar__account" href="/signin">Sign in</a>
			{/if}
			<a class="btn btn--small bar__cta" href="/contact">Get in Touch</a>
			<button
				class="menu-btn"
				type="button"
				bind:this={menuButton}
				aria-expanded={menuOpen}
				aria-controls="menu-panel"
				on:click={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
						<path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
						<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
					</svg>
				{/if}
				<span class="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<div class="panel" id="menu-panel" bind:this={menuPanel}>
		<nav aria-label="Main, mobile">
			<ul>
				{#each NAV as item}
					<li><a href={item.href} on:click={() => (menuOpen = false)}>{item.label}</a></li>
				{/each}
				<li><a href="/calculator" on:click={() => (menuOpen = false)}>Calculator</a></li>
				<li><a href="/faq" on:click={() => (menuOpen = false)}>FAQ</a></li>
				<li>
					<a href={$account ? '/account' : '/signin'} on:click={() => (menuOpen = false)}>
						{$account ? 'Account' : 'Sign in'}
					</a>
				</li>
			</ul>
		</nav>
		<button class="btn btn--ghost" type="button" on:click={closeMenu}>Close menu</button>
	</div>
{/if}

<main id="main" tabindex="-1">
	<slot />
</main>

<section class="invite">
	<div class="wrap invite__inner">
		<div>
			<p class="eyebrow">Get in touch</p>
			<h2>Tell us what you need powered.</h2>
			<p class="lede">
				Heat, hydrogen or electricity, one module or eight. We own it, run it and staff it; you buy the energy.
			</p>
		</div>
		<a class="btn" href="/contact">Get in Touch</a>
	</div>
</section>

<footer class="foot">
	<div class="wrap">
		<div class="foot__grid">
			<div>
				<a class="foot__logo" href="/" aria-label="Zettajoule, home"><Logo size={26} mono /></a>
				<p class="foot__blurb">
					Small high-temperature gas-cooled reactor modules. We sell the energy, not the reactor.
				</p>
			</div>
			<nav aria-label="Footer">
				<h3>Routes</h3>
				<ul>
					{#each NAV as item}
						<li><a href={item.href}>{item.label}</a></li>
					{/each}
				</ul>
			</nav>
			<div>
				<h3>Working routes</h3>
				<ul class="foot__list">
					<li><a href="/calculator">Calculator</a></li>
					<li><a href="/compare">Compare</a></li>
					<li><a href="/faq">FAQ</a></li>
					<li><a href="/account">Account</a></li>
					<li><a href="/investors/room">Document room</a></li>
				</ul>
			</div>
			<div>
				<h3>Follow</h3>
				<ul class="foot__social">
					<li>
						<a href="/company">
							<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
								<rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.6" />
								<path d="M6 9v5M6 6.2v.1M10 14V9m0 2.2c0-1.4 4-1.7 4 .8V14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" />
							</svg>
							Professional network
						</a>
					</li>
					<li>
						<a href="/news">
							<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
								<rect x="2" y="3" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" />
								<path d="M5 7h7M5 10h10M5 13h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							</svg>
							Newsroom
						</a>
					</li>
				</ul>
			</div>
		</div>
		<div class="foot__legal">
			<p>&copy; {year} Zettajoule. All rights reserved.</p>
			<p>Fictional demonstration company. Every mark and plate on this site is drawn from code.</p>
		</div>
	</div>
</footer>

<style>
	.boot {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: var(--z-cover);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.boot__mark {
		color: var(--navy);
	}

	/* chrome exemption 1 of 2: the route-change cover */
	.sweep {
		position: fixed;
		inset: 0;
		background: var(--paper-grey);
		z-index: var(--z-cover);
		transform-origin: left center;
		animation: sweep 520ms ease-in-out forwards;
		pointer-events: none;
	}
	@keyframes sweep {
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
		z-index: var(--z-chrome);
		background: rgba(255, 255, 255, 0.86);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid transparent;
	}
	.bar--scrolled {
		background: rgba(255, 255, 255, 0.96);
		border-bottom-color: var(--rule);
	}
	.bar__inner {
		max-width: var(--maxw);
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		min-height: var(--bar-h);
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.bar__logo {
		color: var(--navy);
		text-decoration: none;
		flex: none;
	}
	.bar__nav {
		flex: 1;
		min-width: 0;
	}
	.bar__nav ul {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem;
		margin: 0;
		padding: 0;
		justify-content: center;
	}
	.bar__nav a {
		display: inline-block;
		padding: 0.45rem 0.5rem;
		font-size: 0.86rem;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}
	.bar__nav a:hover {
		background: var(--paper-grey);
		color: var(--accent-hover);
	}
	.bar__nav a.active {
		color: var(--accent);
		font-weight: 700;
		box-shadow: inset 0 -2px 0 var(--accent);
	}
	.bar__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: none;
	}
	.bar__account {
		font-size: 0.85rem;
		color: var(--ink);
		text-decoration: none;
		max-width: 12ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.bar__account:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.menu-btn {
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
	.menu-btn:hover {
		background: var(--paper-grey);
	}

	.panel {
		position: fixed;
		inset: var(--bar-h) 0 0;
		background: var(--paper);
		z-index: var(--z-panel);
		padding: 1.5rem clamp(1rem, 6vw, 2rem) 2rem;
		overflow-y: auto;
	}
	.panel ul {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
	}
	.panel li + li {
		border-top: 1px solid var(--rule);
	}
	.panel a {
		display: block;
		padding: 0.9rem 0;
		font-family: var(--font-head);
		font-size: 1.25rem;
		color: var(--ink);
		text-decoration: none;
	}
	.panel a:hover {
		color: var(--accent-hover);
	}

	main {
		display: block;
		outline: none;
	}

	.invite {
		border-top: 1px solid var(--rule);
		background: var(--paper-grey);
		padding: clamp(2.5rem, 6vw, 4rem) 0;
	}
	.invite__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}
	.invite h2 {
		margin-bottom: 0.5rem;
	}
	.invite p {
		margin-bottom: 0;
	}

	.foot {
		background: var(--navy);
		color: #dfe6f2;
		padding: clamp(2.5rem, 6vw, 4rem) 0 2rem;
	}
	.foot__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 2rem;
	}
	.foot h3 {
		color: #fff;
		font-size: 0.78rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin-bottom: 0.75rem;
	}
	.foot ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.foot li {
		margin-bottom: 0.4rem;
	}
	.foot a {
		color: #dfe6f2;
		text-decoration: none;
		font-size: 0.9rem;
	}
	.foot a:hover {
		color: #fff;
		text-decoration: underline;
	}
	.foot__logo {
		color: #fff;
		display: inline-block;
		margin-bottom: 0.75rem;
	}
	.foot__blurb {
		font-size: 0.9rem;
		color: #c3cee2;
		max-width: 32ch;
	}
	.foot__social a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.foot__legal {
		border-top: 1px solid rgba(255, 255, 255, 0.18);
		margin-top: 2.5rem;
		padding-top: 1.25rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 2rem;
		justify-content: space-between;
	}
	.foot__legal p {
		margin: 0;
		font-size: 0.82rem;
		color: #adbbd4;
	}

	@media (max-width: 1080px) {
		.bar__nav a {
			padding: 0.4rem 0.35rem;
			font-size: 0.8rem;
		}
	}
	@media (max-width: 900px) {
		.bar__nav,
		.bar__account {
			display: none;
		}
		.menu-btn {
			display: inline-flex;
		}
		.bar__inner {
			justify-content: space-between;
		}
	}
	@media (max-width: 520px) {
		.bar__cta {
			display: none;
		}
	}
</style>
