<script>
  export let size = 30;
  export let light = false;
</script>

<span class="logo">
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    role="img"
    aria-label="Zettajoule mark: a particle circling a core"
    focusable="false"
  >
    <g fill="none" stroke={light ? '#ffffff' : 'var(--accent)'} stroke-width="1.6">
      <ellipse cx="20" cy="20" rx="17" ry="6.5" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(60 20 20)" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(120 20 20)" />
    </g>
    <circle cx="20" cy="20" r="4" fill={light ? '#ffffff' : 'var(--accent)'} />
  </svg>
  <span class="word" class:light>Zettajoule</span>
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 9px;
  }
  .word {
    font-family: var(--font-head);
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: 1.05rem;
    color: var(--ink);
  }
  .word.light {
    color: #fff;
  }
</style>
