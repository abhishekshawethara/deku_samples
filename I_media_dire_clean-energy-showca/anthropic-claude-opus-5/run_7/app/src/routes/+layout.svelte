<script>
  import '$lib/styles.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { navigating } from '$app/stores';
  import { goto } from '$app/navigation';
  import Logo from '$lib/components/Logo.svelte';
  import { api, clearSession, getAccount } from '$lib/api';

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

  let account = null;
  let menuOpen = false;
  let scrolled = false;
  let booting = true;
  let menuBtn;
  let menuPanel;

  function refreshAccount() {
    account = getAccount();
  }

  onMount(() => {
    refreshAccount();
    booting = false;
    const onScroll = () => (scrolled = window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('zj:auth', refreshAccount);
    window.addEventListener('storage', refreshAccount);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('zj:auth', refreshAccount);
      window.removeEventListener('storage', refreshAccount);
    };
  });

  $: $page.url.pathname, (menuOpen = false);

  async function signOut() {
    try {
      await api('/auth/logout', { method: 'POST', redirectOnExpiry: false });
    } catch {
      /* the token is going away regardless */
    }
    clearSession();
    account = null;
    goto('/');
  }

  function onMenuKey(e) {
    if (!menuOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      menuOpen = false;
      menuBtn?.focus();
    }
    if (e.key === 'Tab' && menuPanel) {
      const items = [...menuPanel.querySelectorAll('a, button')].filter((el) => el.offsetParent !== null);
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
  }
</script>

<svelte:window on:keydown={onMenuKey} />

<a class="skip-link" href="#main">Skip to the main content</a>

{#if $navigating}
  <div class="route-cover" aria-hidden="true"></div>
{/if}

<header class="bar" class:scrolled data-testid="topbar">
  <div class="bar-inner">
    <a href="/" class="brand" aria-label="Zettajoule, home"><Logo /></a>

    <nav class="routes" aria-label="Main">
      <ul>
        {#each ROUTES as r}
          <li>
            <a href={r.href} aria-current={$page.url.pathname === r.href ? 'page' : undefined}>{r.label}</a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="actions">
      {#if account}
        <a class="acct" href="/account">{account.display_name}</a>
        <button type="button" class="btn btn-secondary btn-sm" on:click={signOut}>Sign out</button>
      {:else if !booting}
        <a class="acct" href="/signin">Sign in</a>
      {/if}
      <a class="btn btn-sm cta" href="/contact">Get in Touch</a>
      <button
        type="button"
        class="menu-btn"
        bind:this={menuBtn}
        aria-expanded={menuOpen}
        aria-controls="route-menu"
        on:click={() => (menuOpen = !menuOpen)}
      >
        {#if menuOpen}
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2" /></svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 4 H14 M2 8 H14 M2 12 H14" stroke="currentColor" stroke-width="2" /></svg>
        {/if}
        <span class="sr-only">{menuOpen ? 'Close the menu' : 'Open the menu'}</span>
      </button>
    </div>
  </div>
</header>

{#if menuOpen}
  <div class="menu-panel" id="route-menu" bind:this={menuPanel}>
    <nav aria-label="Routes">
      <ul>
        {#each ROUTES as r}
          <li><a href={r.href}>{r.label}</a></li>
        {/each}
        <li><a href="/calculator">Calculator</a></li>
        <li><a href="/compare">Compare</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href={account ? '/account' : '/signin'}>{account ? 'Account' : 'Sign in'}</a></li>
      </ul>
    </nav>
    <a class="btn" href="/contact">Get in Touch</a>
  </div>
{/if}

<main id="main" tabindex="-1">
  <slot />
</main>

<section class="invite">
  <div class="wrap invite-inner">
    <div>
      <p class="eyebrow">Next step</p>
      <h2>Tell us what you need powered.</h2>
      <p class="lede">
        Careers, investor and supplier enquiries all start in the same place. We reply to the address
        you give us with a reference you can quote back.
      </p>
    </div>
    <a class="btn" href="/contact">Get in Touch</a>
  </div>
</section>

<footer class="foot">
  <div class="wrap foot-inner">
    <div class="foot-brand">
      <Logo light />
      <p>Small high-temperature gas-cooled modules. We own them, run them and sell the energy.</p>
    </div>
    <nav aria-label="Footer routes">
      <h3>Routes</h3>
      <ul>
        {#each ROUTES as r}
          <li><a href={r.href}>{r.label}</a></li>
        {/each}
      </ul>
    </nav>
    <nav aria-label="Working routes">
      <h3>Work with it</h3>
      <ul>
        <li><a href="/solutions">Solutions explorer</a></li>
        <li><a href="/calculator">Energy calculator</a></li>
        <li><a href="/compare">Compare saves</a></li>
        <li><a href="/faq">Questions</a></li>
        <li><a href="/account">Account</a></li>
      </ul>
    </nav>
    <div class="foot-social">
      <h3>Elsewhere</h3>
      <ul class="social">
        <li>
          <a href="/contact" aria-label="Professional network profile">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 8v7M5 5.2v.1M9 15V8m0 3c0-2 4-2 4 0v4" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>
            <span class="sr-only">Professional network</span>
          </a>
        </li>
        <li>
          <a href="/contact" aria-label="Short posts profile">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6"/></svg>
            <span class="sr-only">Short posts</span>
          </a>
        </li>
        <li>
          <a href="/news" aria-label="Newsroom feed">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 14a5 5 0 0 1 0-8M8 14a8 8 0 0 0 0-8" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>
            <span class="sr-only">Newsroom feed</span>
          </a>
        </li>
      </ul>
      <p class="legal">
        &copy; 2026 Zettajoule BV. Rotterdam, Chicago, Tokyo.<br />
        Privacy notice, terms of use and cookie statement available on request.
      </p>
    </div>
  </div>
</footer>

<style>
  .route-cover {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: var(--paper);
    pointer-events: none;
    animation: zj-sweep 420ms ease forwards;
    transform-origin: left center;
  }
  @keyframes zj-sweep {
    0% {
      transform: scaleX(0);
      opacity: 1;
    }
    45% {
      transform: scaleX(1);
      opacity: 1;
    }
    100% {
      transform: scaleX(1);
      opacity: 0;
    }
  }

  .bar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: transparent;
    border-bottom: 1px solid transparent;
  }
  .bar.scrolled {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    border-bottom-color: var(--rule);
  }
  .bar-inner {
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 0 20px;
    min-height: var(--bar-h);
    display: flex;
    align-items: center;
    gap: 20px;
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
    gap: 14px;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
  }
  .routes a {
    color: var(--ink);
    text-decoration: none;
    font-size: 0.86rem;
    font-weight: 600;
    padding: 6px 2px;
    display: inline-block;
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
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--rule-strong);
    background: var(--paper);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .menu-panel {
    position: fixed;
    inset: var(--bar-h) 0 0 0;
    z-index: 70;
    background: var(--paper);
    padding: 24px 20px 40px;
    overflow: auto;
    border-top: 1px solid var(--rule);
  }
  .menu-panel ul {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
  }
  .menu-panel li + li {
    border-top: 1px solid var(--rule);
  }
  .menu-panel a {
    display: block;
    padding: 14px 2px;
    font-family: var(--font-head);
    font-size: 1.2rem;
    color: var(--ink);
    text-decoration: none;
  }
  .menu-panel .btn {
    width: 100%;
  }

  @media (max-width: 1080px) {
    .routes ul {
      gap: 10px;
    }
    .routes a {
      font-size: 0.8rem;
    }
  }
  @media (max-width: 940px) {
    .routes,
    .acct {
      display: none;
    }
    .menu-btn {
      display: inline-flex;
    }
    .bar-inner {
      justify-content: space-between;
    }
  }
  @media (max-width: 520px) {
    .cta {
      display: none;
    }
  }

  main:focus {
    outline: none;
  }

  .invite {
    background: var(--sky-soft);
    border-top: 1px solid var(--rule);
    padding: 56px 0;
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
    color: #cdd8e8;
    padding: 48px 0 32px;
  }
  .foot-inner {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
    gap: 28px;
  }
  .foot h3 {
    color: #fff;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .foot p {
    color: #b9c6da;
    font-size: 0.9rem;
  }
  .foot ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .foot li {
    margin-bottom: 7px;
  }
  .foot a {
    color: #dce6f5;
    text-decoration: none;
    font-size: 0.9rem;
  }
  .foot a:hover {
    color: #fff;
    text-decoration: underline;
  }
  .social {
    display: flex;
    gap: 10px;
  }
  .social a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid rgba(255, 255, 255, 0.32);
    border-radius: var(--radius-sm);
    color: #dce6f5;
  }
  .social a:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .legal {
    margin-top: 14px;
    font-size: 0.78rem;
    color: #9db0cb;
  }
  @media (max-width: 900px) {
    .foot-inner {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 560px) {
    .foot-inner {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .route-cover {
      animation: none;
      opacity: 0;
    }
  }
</style>
