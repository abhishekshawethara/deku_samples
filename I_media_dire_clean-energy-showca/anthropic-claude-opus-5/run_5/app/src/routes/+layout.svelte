
<script>
	import '../app.css';
	import { page } from '$app/state';
	import { navigating } from '$app/state';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { getAccount, clearSession, clearSaveToken } from '$lib/api';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const routes = [
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

	let account = $state(null);
	let menuOpen = $state(false);
	let scrolled = $state(false);
	let booted = $state(false);
	let menuPanel = $state(null);
	let menuButton = $state(null);

	$effect(() => {
		if (!browser) return;
		const sync = () => (account = getAccount());
		sync();
		window.addEventListener('zj:session', sync);
		window.addEventListener('storage', sync);
		const onScroll = () => (scrolled = window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		const raf = requestAnimationFrame(() => (booted = true));
		return () => {
			window.removeEventListener('zj:session', sync);
			window.removeEventListener('storage', sync);
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(raf);
		};
	});

	$effect(() => {
		if (!browser) return;
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		if (menuOpen) queueMicrotask(() => menuPanel?.querySelector('a')?.focus());
		return () => {
			document.body.style.overflow = '';
		};
	});

	function closeMenu() {
		if (!menuOpen) return;
		menuOpen = false;
		menuButton?.focus();
	}

	function onMenuKeydown(e) {
		if (e.key === 'Escape') {
			closeMenu();
			return;
		}
		if (e.key !== 'Tab' || !menuPanel) return;
		const items = [...menuPanel.querySelectorAll('a, button')];
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

	function signOut() {
		clearSession();
		clearSaveToken();
		account = null;
		menuOpen = false;
		goto('/');
	}

	let path = $derived(page.url.pathname);
	let isHome = $derived(path === '/');
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<!-- On first load a plain white cover waits until the reactor is ready to draw. -->
{#if !booted}
	<div class="boot-cover" aria-hidden="true">
		<div class="boot-inner"><Logo size={30} /></div>
	</div>
{/if}

<!-- Every route change sweeps a cover across: one of the two chrome exemptions. -->
{#if navigating.to}
	<div class="route-cover" aria-hidden="true"></div>
{/if}

<header class="bar" class:scrolled class:home={isHome}>
	<div class="bar-inner">
		<a class="brand" href="/" aria-label="Zettajoule, home"><Logo size={24} /></a>

		<nav class="desktop-nav" aria-label="Main">
			<ul>
				{#each routes as r}
					<li>
						<a href={r.href} aria-current={path === r.href ? 'page' : undefined}>{r.label}</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="bar-actions">
			{#if account}
				<a class="account-link" href="/account">{account.display_name}</a>
				<button class="btn btn-sm btn-secondary" type="button" onclick={signOut}>Sign out</button>
			{:else}
				<a class="account-link desk-only" href="/signin">Sign in</a>
			{/if}
			<a class="btn btn-sm get-in-touch" href="/contact">Get in Touch</a>
			<button
				class="menu-btn"
				type="button"
				bind:this={menuButton}
				aria-expanded={menuOpen}
				aria-controls="route-menu"
				onclick={() => (menuOpen = true)}
			>
				<svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true" focusable="false">
					<path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" stroke-width="2" fill="none" />
				</svg>
				<span class="visually-hidden">Open menu</span>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="menu-panel"
		id="route-menu"
		bind:this={menuPanel}
		onkeydown={onMenuKeydown}
		role="dialog"
		aria-modal="true"
		aria-label="Routes"
	>
		<div class="menu-head">
			<Logo size={24} />
			<button class="menu-close" type="button" onclick={closeMenu}>
				<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
					<path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" stroke-width="2.2" fill="none" />
				</svg>
				<span class="visually-hidden">Close menu</span>
			</button>
		</div>
		<nav aria-label="Routes">
			<ul class="menu-list">
				{#each routes as r}
					<li><a href={r.href} onclick={() => (menuOpen = false)}>{r.label}</a></li>
				{/each}
				<li><a href="/calculator" onclick={() => (menuOpen = false)}>Calculator</a></li>
				<li><a href="/compare" onclick={() => (menuOpen = false)}>Compare</a></li>
				<li><a href="/faq" onclick={() => (menuOpen = false)}>FAQ</a></li>
				<li>
					<a href={account ? '/account' : '/signin'} onclick={() => (menuOpen = false)}>
						{account ? 'Account' : 'Sign in'}
					</a>
				</li>
			</ul>
		</nav>
	</div>
{/if}

<main id="main">
	{@render children?.()}
</main>

<section class="invite">
	<div class="wrap invite-inner">
		<div>
			<p class="eyebrow">Get in touch</p>
			<h2>Tell us what your site needs</h2>
			<p class="lede">
				Heat, power, hydrogen or water. We own the plant, run it and staff it; you buy the energy.
			</p>
		</div>
		<a class="btn" href="/contact">Get in Touch</a>
	</div>
</section>

<footer class="foot">
	<div class="wrap">
		<div class="foot-top">
			<div class="foot-brand">
				<Logo size={26} dark />
				<p>Small high-temperature gas-cooled reactor modules. We sell the energy, not the reactor.</p>
				<ul class="social" aria-label="Social">
					{#each [['In', 'Professional network'], ['X', 'Short posts'], ['Rs', 'Research index']] as [mark, name]}
						<li>
							<span class="social-mark" aria-hidden="true">{mark}</span>
							<span class="visually-hidden">{name}</span>
						</li>
					{/each}
				</ul>
			</div>
			<nav class="foot-nav" aria-label="Footer">
				<ul>
					{#each routes as r}
						<li><a href={r.href}>{r.label}</a></li>
					{/each}
					<li><a href="/calculator">Calculator</a></li>
					<li><a href="/compare">Compare</a></li>
					<li><a href="/faq">FAQ</a></li>
					<li><a href="/investors/room">Document room</a></li>
				</ul>
			</nav>
		</div>
		<div class="foot-legal">
			<p>Copyright 2026 Zettajoule BV. All rights reserved.</p>
			<p>Rotterdam, Netherlands. Registered in the Netherlands. Nuclear operations under licence.</p>
		</div>
	</div>
</footer>

<style>
	.boot-cover {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: var(--z-cover);
		display: grid;
		place-items: center;
	}
	.route-cover {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: var(--z-cover);
		transform-origin: left;
		animation: sweep 420ms ease-in-out forwards;
		pointer-events: none;
	}
	@keyframes sweep {
		0% {
			transform: scaleX(0);
		}
		48% {
			transform: scaleX(1);
			transform-origin: left;
		}
		52% {
			transform: scaleX(1);
			transform-origin: right;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right;
		}
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: var(--z-chrome);
		background: transparent;
		border-bottom: var(--hair) solid transparent;
	}
	.bar:not(.home) {
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(9px);
		border-bottom-color: var(--rule);
	}
	.bar.scrolled {
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(9px);
		border-bottom-color: var(--rule);
	}
	.bar-inner {
		max-width: var(--maxw);
		margin: 0 auto;
		padding: 0 20px;
		height: var(--bar-h);
		display: flex;
		align-items: center;
		gap: 18px;
	}
	.brand {
		text-decoration: none;
		flex: none;
	}
	.desktop-nav {
		flex: 1;
		min-width: 0;
	}
	.desktop-nav ul {
		display: flex;
		gap: 3px;
		list-style: none;
		margin: 0;
		padding: 0;
		justify-content: center;
		flex-wrap: nowrap;
	}
	.desktop-nav a {
		display: block;
		padding: 7px 9px;
		border-radius: 7px;
		color: var(--ink);
		text-decoration: none;
		font-size: 0.83rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.desktop-nav a:hover {
		background: var(--surface-sunk);
		color: var(--accent-hover);
	}
	.desktop-nav a[aria-current='page'] {
		color: var(--accent);
		box-shadow: inset 0 -2px 0 var(--accent);
	}
	.bar-actions {
		display: flex;
		align-items: center;
		gap: 9px;
		flex: none;
	}
	.account-link {
		font-size: 0.83rem;
		font-weight: 650;
		color: var(--ink);
		text-decoration: none;
		max-width: 130px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.account-link:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.get-in-touch {
		white-space: nowrap;
	}
	.menu-btn {
		display: none;
		width: 42px;
		height: 42px;
		border-radius: 9px;
		border: var(--hair) solid var(--rule);
		background: var(--surface);
		color: var(--ink);
		place-items: center;
		cursor: pointer;
	}
	.menu-btn:hover {
		background: var(--surface-sunk);
	}

	.menu-panel {
		position: fixed;
		inset: 0;
		background: var(--surface);
		z-index: var(--z-panel);
		padding: 16px 20px 40px;
		overflow: auto;
	}
	.menu-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--bar-h);
	}
	.menu-close {
		width: 42px;
		height: 42px;
		border-radius: 999px;
		border: var(--hair) solid var(--rule);
		background: var(--surface);
		color: var(--ink);
		display: grid;
		place-items: center;
		cursor: pointer;
	}
	.menu-list {
		list-style: none;
		margin: 18px 0 0;
		padding: 0;
	}
	.menu-list li {
		border-top: var(--hair) solid var(--rule);
	}
	.menu-list a {
		display: block;
		padding: 15px 4px;
		font-family: var(--font-head);
		font-size: 1.35rem;
		color: var(--ink);
		text-decoration: none;
	}
	.menu-list a:hover {
		color: var(--accent-hover);
	}

	.invite {
		border-top: var(--hair) solid var(--rule);
		background: var(--surface-sunk);
	}
	.invite-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 26px;
		padding-top: 46px;
		padding-bottom: 46px;
		flex-wrap: wrap;
	}
	.invite h2 {
		margin-bottom: 8px;
	}
	.invite p:last-of-type {
		margin: 0;
	}

	.foot {
		background: var(--navy);
		color: #cbd6e6;
		padding: 46px 0 26px;
	}
	.foot-top {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
		gap: 34px;
	}
	.foot-brand p {
		margin: 14px 0 16px;
		max-width: 40ch;
		font-size: 0.92rem;
	}
	.social {
		display: flex;
		gap: 9px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.social-mark {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 999px;
		border: var(--hair) solid rgba(255, 255, 255, 0.35);
		font-size: 0.75rem;
		font-weight: 700;
		color: #fff;
	}
	.foot-nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 9px 16px;
	}
	.foot-nav a {
		color: #cbd6e6;
		text-decoration: none;
		font-size: 0.92rem;
	}
	.foot-nav a:hover {
		color: #fff;
		text-decoration: underline;
	}
	.foot-legal {
		margin-top: 34px;
		padding-top: 18px;
		border-top: var(--hair) solid rgba(255, 255, 255, 0.18);
		font-size: 0.82rem;
		color: #9fb0c8;
	}
	.foot-legal p {
		margin: 0 0 4px;
	}

	@media (max-width: 1080px) {
		.desktop-nav {
			display: none;
		}
		.menu-btn {
			display: grid;
		}
		.bar-inner {
			justify-content: space-between;
		}
	}
	@media (max-width: 620px) {
		.desk-only,
		.account-link {
			display: none;
		}
		.foot-top {
			grid-template-columns: minmax(0, 1fr);
		}
		.foot-nav ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.route-cover {
			animation-duration: 1ms;
		}
	}
</style>
