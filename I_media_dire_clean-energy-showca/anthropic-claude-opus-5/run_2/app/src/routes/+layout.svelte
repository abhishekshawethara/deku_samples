<script>
	import '$lib/styles.css';
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/stores';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { account, token, logout } from '$lib/session.js';

	const MENU = [
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
	let booted = false;
	let bootPercent = 0;
	let menuButton;
	let panel;

	$: path = $page.url.pathname;

	function closeMenu() {
		menuOpen = false;
		menuButton?.focus();
	}

	function onKeydown(e) {
		if (e.key === 'Escape' && menuOpen) {
			e.preventDefault();
			closeMenu();
			return;
		}
		if (e.key === 'Tab' && menuOpen && panel) {
			const f = panel.querySelectorAll('a[href], button:not([disabled])');
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

	$: if (browser && path) menuOpen = false;

	onMount(() => {
		const onScroll = () => (scrolled = window.scrollY > 8);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		// the counter reflects the real download rather than a guess
		const tick = () => {
			const entries = performance.getEntriesByType('resource');
			const done = entries.filter((e) => e.responseEnd > 0).length;
			const expected = Math.max(done, entries.length, 1);
			bootPercent = Math.min(100, Math.round((done / expected) * 100));
		};
		tick();
		const iv = setInterval(tick, 60);
		const finish = () => {
			bootPercent = 100;
			booted = true;
			clearInterval(iv);
		};
		if (document.readyState === 'complete') requestAnimationFrame(finish);
		else window.addEventListener('load', () => requestAnimationFrame(finish), { once: true });
		const guard = setTimeout(finish, 2500);
		return () => {
			window.removeEventListener('scroll', onScroll);
			clearInterval(iv);
			clearTimeout(guard);
		};
	});
</script>

<svelte:window on:keydown={onKeydown} />

<a class="skip-link" href="#main">Skip to content</a>

{#if browser && !booted}
	<div class="boot" aria-hidden="true">
		<div class="boot-inner">
			<Logo size={38} showName={false} />
			<span class="boot-count mono">{bootPercent}%</span>
		</div>
	</div>
{/if}

{#if $navigating}
	<div class="route-cover" aria-hidden="true"></div>
	<p class="visually-hidden" role="status">Loading the next page</p>
{/if}

<header class="bar" class:scrolled data-testid="top-bar">
	<div class="bar-inner">
		<a class="brand" href="/" aria-label="Zettajoule, home"><Logo /></a>
		<nav class="routes" aria-label="Main">
			<ul>
				{#each MENU as item}
					<li>
						<a href={item.href} aria-current={path === item.href ? 'page' : undefined}>{item.label}</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="bar-actions">
			{#if $token}
				<a class="account-link" href="/account">Account</a>
				<button type="button" class="btn btn-quiet btn-sm" on:click={logout}>Sign out</button>
			{:else}
				<a class="account-link" href="/signin">Sign in</a>
			{/if}
			<a class="btn btn-sm cta" href="/contact">Get in Touch</a>
			<button
				type="button"
				class="menu-btn"
				bind:this={menuButton}
				aria-expanded={menuOpen}
				aria-controls="route-panel"
				on:click={() => (menuOpen = !menuOpen)}
			>
				<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
					<path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="2" fill="none" />
				</svg>
				<span class="visually-hidden">Open the route menu</span>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<div class="panel" id="route-panel" bind:this={panel}>
		<div class="panel-head">
			<Logo />
			<button type="button" class="menu-btn" on:click={closeMenu}>
				<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
					<path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" stroke-width="2" fill="none" />
				</svg>
				<span class="visually-hidden">Close the route menu</span>
			</button>
		</div>
		<nav aria-label="Routes">
			<ul class="panel-list">
				{#each MENU as item}
					<li><a href={item.href} on:click={() => (menuOpen = false)}>{item.label}</a></li>
				{/each}
				<li><a href="/calculator" on:click={() => (menuOpen = false)}>Calculator</a></li>
				<li><a href="/faq" on:click={() => (menuOpen = false)}>FAQ</a></li>
				<li>
					<a href={$token ? '/account' : '/signin'} on:click={() => (menuOpen = false)}>
						{$token ? 'Account' : 'Sign in'}
					</a>
				</li>
			</ul>
		</nav>
	</div>
{/if}

<main id="main" tabindex="-1">
	<slot />
</main>

<section class="invite">
	<div class="wrap invite-inner">
		<div>
			<p class="eyebrow">Get in touch</p>
			<h2>Tell us what you need powered.</h2>
			<p class="lede">
				Heat, hydrogen or electricity, on your site, sold by the unit. We own the module, run it and staff it.
			</p>
		</div>
		<a class="btn" href="/contact">Get in Touch</a>
	</div>
</section>

<footer class="foot">
	<div class="wrap foot-inner">
		<div class="foot-brand">
			<Logo tone="#9dc0ff" />
			<p>Small high-temperature gas-cooled reactor modules. We sell the energy, not the reactor.</p>
		</div>
		<nav aria-label="Footer routes">
			<h3>Routes</h3>
			<ul>
				{#each MENU as item}<li><a href={item.href}>{item.label}</a></li>{/each}
			</ul>
		</nav>
		<nav aria-label="More">
			<h3>More</h3>
			<ul>
				<li><a href="/calculator">Calculator</a></li>
				<li><a href="/compare">Compare</a></li>
				<li><a href="/faq">FAQ</a></li>
				<li><a href="/account">Account</a></li>
			</ul>
		</nav>
		<div>
			<h3>Elsewhere</h3>
			<ul class="social">
				<li>
					<a href="/contact" aria-label="Zettajoule on a professional network">
						<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
							<rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.6" />
							<path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 0 1 4 0v4" stroke="currentColor" stroke-width="1.6" fill="none" />
						</svg>
						<span>Professional network</span>
					</a>
				</li>
				<li>
					<a href="/news" aria-label="Zettajoule newsroom feed">
						<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
							<circle cx="6" cy="18" r="1.6" fill="currentColor" />
							<path d="M4 11a9 9 0 0 1 9 9M4 5a15 15 0 0 1 15 15" stroke="currentColor" stroke-width="1.6" fill="none" />
						</svg>
						<span>Newsroom feed</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
	<div class="wrap legal">
		<p>&copy; {new Date().getFullYear()} Zettajoule. All rights reserved.</p>
		<p>Demonstration site. Names, portraits and stories are stand-ins drawn from code.</p>
	</div>
</footer>

<style>
	:global(main) {
		outline: none;
		min-height: 50vh;
	}
	.boot {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 160;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.boot-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}
	.boot-count {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
	.route-cover {
		position: fixed;
		inset: 0;
		background: var(--navy);
		z-index: 150;
		pointer-events: none;
	}
	.bar {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid transparent;
	}
	.bar.scrolled {
		background: #fff;
		border-bottom-color: var(--rule);
	}
	.bar-inner {
		max-width: var(--maxw);
		margin: 0 auto;
		padding: 0 24px;
		height: var(--bar-h);
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.brand {
		text-decoration: none;
		flex: none;
	}
	.routes {
		flex: 1;
		min-width: 0;
	}
	.routes ul {
		list-style: none;
		display: flex;
		gap: 16px;
		margin: 0;
		padding: 0;
		flex-wrap: nowrap;
	}
	.routes a {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 0.83rem;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
		padding: 6px 2px;
		border-bottom: 2px solid transparent;
	}
	.routes a:hover {
		color: var(--accent-hover);
		border-bottom-color: var(--accent-hover);
	}
	.routes a[aria-current='page'] {
		border-bottom-color: var(--accent);
		color: var(--accent);
	}
	.bar-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: none;
	}
	.account-link {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 0.83rem;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
	}
	.account-link:hover {
		color: var(--accent-hover);
	}
	.menu-btn {
		display: none;
		min-width: 44px;
		min-height: 44px;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius-sm);
		color: var(--ink);
		cursor: pointer;
	}
	.menu-btn:hover {
		background: var(--ground-soft);
	}
	.panel {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 130;
		padding: 16px 24px 40px;
		overflow-y: auto;
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
		padding: 16px 0;
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.4rem;
		color: var(--ink);
		text-decoration: none;
	}
	.panel-list a:hover {
		color: var(--accent-hover);
	}
	.invite {
		border-top: 1px solid var(--rule);
		background: var(--ground-soft);
		padding: 48px 0;
	}
	.invite-inner {
		display: flex;
		gap: 28px;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.invite h2 {
		margin-bottom: 8px;
	}
	.foot {
		background: var(--navy);
		color: #cfd9e8;
		padding: 48px 0 24px;
	}
	.foot-inner {
		display: grid;
		grid-template-columns: 1.6fr 1fr 1fr 1fr;
		gap: 28px;
	}
	.foot h3 {
		color: #fff;
		font-size: 0.78rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.foot ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.foot a {
		color: #cfd9e8;
		text-decoration: none;
		font-size: 0.92rem;
	}
	.foot a:hover {
		color: #fff;
		text-decoration: underline;
	}
	.foot-brand p {
		margin-top: 12px;
		font-size: 0.92rem;
		max-width: 34ch;
	}
	.foot-brand :global(.name) {
		color: #fff;
	}
	.social a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.legal {
		margin-top: 32px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.16);
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		font-size: 0.84rem;
		color: #9fb0c9;
	}
	.legal p {
		margin: 0;
	}
	@media (max-width: 1080px) {
		.routes,
		.account-link {
			display: none;
		}
		.menu-btn {
			display: inline-flex;
		}
		.bar-inner {
			justify-content: space-between;
		}
	}
	@media (max-width: 760px) {
		.foot-inner {
			grid-template-columns: 1fr 1fr;
		}
		.cta {
			display: none;
		}
	}
</style>
