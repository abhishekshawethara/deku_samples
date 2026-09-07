<script>
	import '$lib/styles/app.css';
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Logo from '$lib/art/Logo.svelte';
	import { MENU } from '$lib/nav.js';
	import { auth, clearSession, savedSlugs, currentSaveToken } from '$lib/stores.js';

	let menuOpen = false;
	let scrolled = false;
	let menuBtn;
	let panelEl;
	let booted = false;
	let bootPercent = 0;

	$: path = $page.url.pathname;

	function isActive(href) {
		return path === href || path.startsWith(href + '/');
	}

	function onScroll() {
		scrolled = window.scrollY > 8;
	}

	function closeMenu() {
		menuOpen = false;
		menuBtn?.focus();
	}

	function onKeydown(e) {
		if (e.key === 'Escape' && menuOpen) {
			e.preventDefault();
			closeMenu();
			return;
		}
		if (e.key === 'Tab' && menuOpen && panelEl) {
			const nodes = Array.from(
				panelEl.querySelectorAll('a[href], button:not([disabled])')
			).filter((n) => n.offsetParent !== null);
			if (!nodes.length) return;
			const first = nodes[0];
			const last = nodes[nodes.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	async function signOut() {
		clearSession();
		savedSlugs.set(new Set());
		menuOpen = false;
		await goto('/');
	}

	async function refreshSaved() {
		try {
			const token = $auth.token;
			const st = token ? null : currentSaveToken();
			if (!token && !st) {
				savedSlugs.set(new Set());
				return;
			}
			const qs = st ? `?save_token=${encodeURIComponent(st)}` : '';
			const res = await fetch(`/api/saves${qs}`, {
				headers: token ? { authorization: `Bearer ${token}` } : {}
			});
			if (!res.ok) return;
			const rows = await res.json();
			savedSlugs.set(new Set(rows.map((r) => r.slug)));
		} catch {
			/* leave saved marks as they are */
		}
	}

	onMount(() => {
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('keydown', onKeydown);
		refreshSaved();

		/* Loading cover: counter reflects real document progress, then lifts. */
		let raf;
		const tick = () => {
			bootPercent = Math.min(100, bootPercent + Math.max(3, (100 - bootPercent) * 0.28));
			if (bootPercent >= 99.5) {
				bootPercent = 100;
				booted = true;
			} else raf = requestAnimationFrame(tick);
		};
		if (document.readyState === 'complete') {
			bootPercent = 100;
			booted = true;
		} else {
			raf = requestAnimationFrame(tick);
			window.addEventListener('load', () => {
				bootPercent = 100;
				booted = true;
			});
		}
		const guard = setTimeout(() => {
			bootPercent = 100;
			booted = true;
		}, 2200);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('keydown', onKeydown);
			cancelAnimationFrame(raf);
			clearTimeout(guard);
		};
	});

	$: if (browser) refreshSavedOnAuth($auth.token);
	let lastToken;
	function refreshSavedOnAuth(t) {
		if (t === lastToken) return;
		lastToken = t;
		refreshSaved();
	}

	$: if (browser && menuOpen) document.body.style.overflow = 'hidden';
	$: if (browser && !menuOpen) document.body.style.overflow = '';
	$: if (path) menuOpen = false;
</script>

<a class="skip-link" href="#main">Skip to content</a>

{#if browser && !booted}
	<div class="boot-cover" aria-hidden="true">
		<Logo size={44} />
		<p class="boot-count">{Math.round(bootPercent)}%</p>
	</div>
{/if}

{#if $navigating}
	<div class="route-cover" aria-hidden="true"></div>
	<p class="sr-only" role="status">Loading page</p>
{/if}

<header class="topbar" class:scrolled>
	<div class="bar wrap">
		<a class="brand" href="/" aria-label="Zettajoule, home"><Logo size={28} /></a>

		<nav class="routes" aria-label="Main">
			<ul>
				{#each MENU as item}
					<li>
						<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}
							>{item.label}</a
						>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="actions">
			{#if $auth.token}
				<a class="acct" href="/account">Account</a>
				<button class="btn btn-sm ghost" type="button" on:click={signOut}>Sign out</button>
			{:else}
				<a class="acct" href="/signin">Sign in</a>
			{/if}
			<a class="btn btn-primary btn-sm cta" href="/contact">Get in Touch</a>
			<button
				class="menu-btn"
				type="button"
				bind:this={menuBtn}
				aria-expanded={menuOpen}
				aria-controls="route-panel"
				on:click={() => (menuOpen = !menuOpen)}
			>
				<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
					<path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
				<span class="sr-only">Open menu</span>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<div class="panel" id="route-panel" bind:this={panelEl}>
		<div class="panel-head wrap">
			<Logo size={28} />
			<button class="menu-btn close" type="button" on:click={closeMenu}>
				<svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
					<path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
				<span class="sr-only">Close menu</span>
			</button>
		</div>
		<nav class="panel-routes wrap" aria-label="Main menu">
			<ul>
				{#each MENU as item}
					<li>
						<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</a>
					</li>
				{/each}
				<li><a href="/calculator">Calculator</a></li>
				<li><a href="/compare">Compare</a></li>
				<li><a href="/faq">FAQ</a></li>
				<li>
					{#if $auth.token}
						<a href="/account">Account</a>
					{:else}
						<a href="/signin">Sign in</a>
					{/if}
				</li>
			</ul>
			<a class="btn btn-primary" href="/contact">Get in Touch</a>
		</nav>
	</div>
{/if}

<main id="main" tabindex="-1">
	<slot />
</main>

<section class="invite">
	<div class="wrap">
		<p class="eyebrow">Get in touch</p>
		<h2>Tell us what you need powered.</h2>
		<p class="lede">
			Heat, hydrogen or electricity, on your site, under a long term contract. We own it, we run it
			and we staff it.
		</p>
		<a class="btn btn-primary" href="/contact">Get in Touch</a>
	</div>
</section>

<footer class="foot">
	<div class="wrap foot-grid">
		<div class="foot-brand">
			<Logo size={30} tone="light" />
			<p>Small high-temperature gas-cooled reactor modules. We sell the energy, not the reactor.</p>
			<ul class="social" aria-label="Social">
				<li>
					<a href="/contact" aria-label="Zettajoule on a professional network">
						<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
							<rect x="1" y="1" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.4" />
							<path d="M5 7.5V13M5 4.6v.1M8.6 13V9.6a2 2 0 0 1 4 0V13" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
						</svg>
						<span class="sr-only">Professional network</span>
					</a>
				</li>
				<li>
					<a href="/news" aria-label="Zettajoule news feed">
						<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
							<circle cx="4" cy="14" r="1.6" fill="currentColor" />
							<path d="M3 8.4a6.6 6.6 0 0 1 6.6 6.6M3 3.6A11.4 11.4 0 0 1 14.4 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
						<span class="sr-only">News feed</span>
					</a>
				</li>
			</ul>
		</div>
		<nav class="foot-routes" aria-label="Footer">
			<div>
				<h3>Company</h3>
				<ul>
					<li><a href="/company">Company</a></li>
					<li><a href="/team">Our Team</a></li>
					<li><a href="/careers">Careers</a></li>
					<li><a href="/news">News</a></li>
				</ul>
			</div>
			<div>
				<h3>Product</h3>
				<ul>
					<li><a href="/technology">Technology</a></li>
					<li><a href="/solutions">Solutions</a></li>
					<li><a href="/edge">Our Edge</a></li>
					<li><a href="/calculator">Calculator</a></li>
				</ul>
			</div>
			<div>
				<h3>More</h3>
				<ul>
					<li><a href="/investors">Investors</a></li>
					<li><a href="/compare">Compare</a></li>
					<li><a href="/faq">FAQ</a></li>
					<li><a href="/contact">Contact</a></li>
				</ul>
			</div>
		</nav>
	</div>
	<div class="wrap legal">
		<p>Copyright {new Date().getFullYear()} Zettajoule. A demonstration site; the people and stories are stand-ins.</p>
		<p>Privacy notice, terms of use and cookie statement available on request.</p>
	</div>
</footer>

<style>
	:global(body) {
		padding-top: var(--nav-h);
	}
	main:focus {
		outline: none;
	}

	.boot-cover {
		position: fixed;
		inset: 0;
		z-index: var(--z-cover);
		background: #fff;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
	}
	.boot-count {
		font-family: var(--font-mono);
		color: var(--ink-muted);
		margin: 0;
	}

	/* Chrome exemption 1 of 2: the route-change cover sweeps across. */
	.route-cover {
		position: fixed;
		inset: 0;
		z-index: var(--z-cover);
		background: var(--paper);
		transform-origin: left;
		animation: zj-sweep 520ms ease-in-out forwards;
		pointer-events: none;
	}
	@keyframes zj-sweep {
		0% {
			transform: scaleX(0);
		}
		45% {
			transform: scaleX(1);
			transform-origin: left;
		}
		55% {
			transform: scaleX(1);
			transform-origin: right;
		}
		100% {
			transform: scaleX(0);
			transform-origin: right;
		}
	}

	.topbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-chrome);
		height: var(--nav-h);
		background: transparent;
		border-bottom: 1px solid transparent;
	}
	.topbar.scrolled {
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(10px);
		border-bottom-color: var(--rule);
	}
	.bar {
		height: var(--nav-h);
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
		gap: 2px;
		margin: 0;
		padding: 0;
		flex-wrap: wrap;
	}
	.routes a {
		display: inline-block;
		padding: 8px 9px;
		font-size: 0.86rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
		border-radius: var(--r-sm);
	}
	.routes a:hover {
		color: var(--accent-hover);
		background: var(--accent-tint);
	}
	.routes a[aria-current='page'] {
		color: var(--accent);
		box-shadow: inset 0 -2px 0 var(--accent);
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: none;
	}
	.acct {
		font-size: 0.86rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
	}
	.acct:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
	.ghost {
		background: transparent;
		border-color: transparent;
	}
	.menu-btn {
		display: none;
		width: 44px;
		height: 44px;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--rule-strong);
		border-radius: var(--r-md);
		background: var(--paper);
		cursor: pointer;
		color: var(--ink);
	}
	.menu-btn:hover {
		background: var(--paper-3);
	}

	.panel {
		position: fixed;
		inset: 0;
		z-index: var(--z-panel);
		background: var(--paper);
		overflow-y: auto;
		padding-bottom: 40px;
	}
	.panel-head {
		height: var(--nav-h);
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--rule);
	}
	.panel-head .close {
		display: inline-flex;
	}
	.panel-routes ul {
		list-style: none;
		margin: 0 0 22px;
		padding: 0;
	}
	.panel-routes li {
		border-bottom: 1px solid var(--rule);
	}
	.panel-routes a {
		display: block;
		padding: 15px 2px;
		font-family: var(--font-head);
		font-size: 1.25rem;
		color: var(--ink);
		text-decoration: none;
	}
	.panel-routes a:hover {
		color: var(--accent-hover);
	}
	.panel-routes > a {
		width: 100%;
	}

	.invite {
		background: var(--paper-2);
		border-top: 1px solid var(--rule);
		padding-block: clamp(44px, 7vw, 88px);
	}
	.invite h2 {
		max-width: 18ch;
	}
	.invite .lede {
		margin-bottom: 22px;
	}

	.foot {
		background: var(--navy);
		color: #ccd5e2;
		padding-block: 48px 26px;
	}
	.foot :global(a) {
		color: #cfe0f7;
	}
	.foot :global(a:hover) {
		color: #fff;
	}
	.foot-grid {
		display: grid;
		grid-template-columns: minmax(230px, 1fr) 2fr;
		gap: 36px;
	}
	.foot-brand p {
		margin-top: 14px;
		font-size: 0.9rem;
		color: #a8b4c6;
		max-width: 34ch;
	}
	.social {
		list-style: none;
		display: flex;
		gap: 10px;
		padding: 0;
		margin: 16px 0 0;
	}
	.social a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid rgba(255, 255, 255, 0.24);
		border-radius: var(--r-md);
		color: #cfe0f7;
	}
	.social a:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.foot-routes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 24px;
	}
	.foot-routes h3 {
		font-size: 0.74rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #8b9ab1;
		margin-bottom: 12px;
	}
	.foot-routes ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.foot-routes a {
		font-size: 0.9rem;
		text-decoration: none;
	}
	.foot-routes a:hover {
		text-decoration: underline;
	}
	.legal {
		margin-top: 34px;
		padding-top: 18px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}
	.legal p {
		margin: 0 0 4px;
		font-size: 0.8rem;
		color: #8b9ab1;
	}

	@media (max-width: 1080px) {
		.routes {
			display: none;
		}
		.menu-btn {
			display: inline-flex;
		}
		.acct {
			display: none;
		}
		.ghost {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.cta {
			display: none;
		}
		.foot-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
