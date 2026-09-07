<script>
  import { onMount } from 'svelte';

  /** progress 0..1 : 0 = whole metallic machine, 1 = exploded technical drawing */
  export let progress = 0;
  export let interactive = false;
  export let height = 460;
  export let idPrefix = 'rx';

  let reduced = false;
  let activePart = null;

  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;
    const on = () => (reduced = mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  });

  $: p = reduced ? 0 : Math.max(0, Math.min(1, progress));
  // stage 1: rods lift, stage 2: dome lifts, stage 3: metal becomes line drawing
  $: rodLift = Math.min(1, p / 0.35) * 78;
  $: domeLift = Math.max(0, Math.min(1, (p - 0.25) / 0.35)) * 104;
  $: coreReveal = Math.max(0, Math.min(1, (p - 0.35) / 0.3));
  $: lineMode = Math.max(0, Math.min(1, (p - 0.6) / 0.35));
  $: metal = 1 - lineMode;

  const parts = {
    rods: 'Control rods, lifted clear of the core',
    dome: 'Pressure vessel dome, the rounded lid',
    core: 'Core, a dark column of coated particle fuel in graphite',
    vessel: 'Steel pressure vessel holding the helium primary circuit',
    base: 'Base and helium circulator, returning gas to the core'
  };

  function pick(name) {
    if (!interactive) return;
    activePart = activePart === name ? null : name;
  }
</script>

<div class="reactor" style={`--h:${height}px`}>
  <svg
    viewBox="0 0 320 480"
    height={height}
    role="img"
    aria-label="Cutaway of a high-temperature gas-cooled reactor module: control rods, dome, core, vessel and base"
    class="svg"
  >
    <defs>
      <linearGradient id={`${idPrefix}-steel`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8d949c" />
        <stop offset="16%" stop-color="#e9edf1" />
        <stop offset="34%" stop-color="#aeb6be" />
        <stop offset="52%" stop-color="#f6f8fa" />
        <stop offset="72%" stop-color="#9aa2ab" />
        <stop offset="88%" stop-color="#d8dde2" />
        <stop offset="100%" stop-color="#767d85" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-steel-dark`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5d646c" />
        <stop offset="22%" stop-color="#c4cbd2" />
        <stop offset="50%" stop-color="#7f868e" />
        <stop offset="78%" stop-color="#d3d9df" />
        <stop offset="100%" stop-color="#565d64" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-core`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a2a1c" />
        <stop offset="45%" stop-color="#6b3f14" />
        <stop offset="100%" stop-color="#241a12" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ffb45e" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#ffb45e" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- ground shadow -->
    <ellipse cx="160" cy="432" rx="104" ry="13" fill="#0b1f3d" opacity={0.1 * metal + 0.04} />

    <!-- base and circulator -->
    <g
      class="part"
      class:active={activePart === 'base'}
      role={interactive ? 'button' : undefined}
      tabindex={interactive ? 0 : undefined}
      aria-label={interactive ? parts.base : undefined}
      on:click={() => pick('base')}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('base'))}
    >
      <rect
        x="72"
        y="368"
        width="176"
        height="52"
        rx="8"
        fill={`url(#${idPrefix}-steel-dark)`}
        fill-opacity={metal}
        stroke="var(--navy)"
        stroke-width="1.4"
      />
      <rect x="96" y="382" width="46" height="24" rx="4" fill="none" stroke="var(--navy)" stroke-width="1.1" />
      <circle cx="200" cy="394" r="15" fill="none" stroke="var(--navy)" stroke-width="1.1" />
      <path d="M190 394 h20 M200 384 v20" stroke="var(--navy)" stroke-width="1.1" />
    </g>

    <!-- pressure vessel -->
    <g
      class="part"
      class:active={activePart === 'vessel'}
      role={interactive ? 'button' : undefined}
      tabindex={interactive ? 0 : undefined}
      aria-label={interactive ? parts.vessel : undefined}
      on:click={() => pick('vessel')}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('vessel'))}
    >
      <rect
        x="94"
        y="176"
        width="132"
        height="196"
        rx="14"
        fill={`url(#${idPrefix}-steel)`}
        fill-opacity={metal}
        stroke="var(--navy)"
        stroke-width="1.6"
      />
      <path
        d="M110 210 h100 M110 250 h100 M110 290 h100 M110 330 h100"
        stroke="var(--navy)"
        stroke-width="0.8"
        opacity={0.35 + 0.5 * lineMode}
      />
      <!-- hot gas duct out to the heat interface -->
      <path
        d="M226 300 h56 v-46"
        fill="none"
        stroke="var(--navy)"
        stroke-width="1.6"
      />
      <path d="M276 258 l6 -12 l6 12 z" fill="var(--navy)" />
    </g>

    <!-- core, exposed as the dome lifts -->
    <g
      class="part"
      class:active={activePart === 'core'}
      role={interactive ? 'button' : undefined}
      tabindex={interactive ? 0 : undefined}
      aria-label={interactive ? parts.core : undefined}
      opacity={interactive ? 1 : 0.25 + 0.75 * coreReveal}
      on:click={() => pick('core')}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('core'))}
    >
      <ellipse cx="160" cy="270" rx="86" ry="86" fill={`url(#${idPrefix}-glow)`} opacity={coreReveal * 0.7} />
      <rect
        x="126"
        y="206"
        width="68"
        height="140"
        rx="6"
        fill={`url(#${idPrefix}-core)`}
        fill-opacity={0.25 + 0.75 * metal}
        stroke="var(--navy)"
        stroke-width="1.4"
      />
      {#each [0, 1, 2, 3, 4] as row}
        {#each [0, 1, 2] as col}
          <circle
            cx={140 + col * 20}
            cy={222 + row * 26}
            r="6"
            fill="none"
            stroke={lineMode > 0.5 ? 'var(--navy)' : '#f2c98a'}
            stroke-width="1.1"
          />
        {/each}
      {/each}
    </g>

    <!-- dome -->
    <g
      class="part"
      class:active={activePart === 'dome'}
      transform={`translate(0 ${-domeLift})`}
      role={interactive ? 'button' : undefined}
      tabindex={interactive ? 0 : undefined}
      aria-label={interactive ? parts.dome : undefined}
      on:click={() => pick('dome')}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('dome'))}
    >
      <path
        d="M94 190 a66 58 0 0 1 132 0 z"
        fill={`url(#${idPrefix}-steel)`}
        fill-opacity={metal}
        stroke="var(--navy)"
        stroke-width="1.6"
      />
      <path d="M112 170 a48 40 0 0 1 96 0" fill="none" stroke="var(--navy)" stroke-width="0.8" opacity="0.6" />
      <rect x="94" y="186" width="132" height="10" rx="3" fill={`url(#${idPrefix}-steel-dark)`} fill-opacity={metal} stroke="var(--navy)" stroke-width="1.2" />
    </g>

    <!-- control rods -->
    <g
      class="part"
      class:active={activePart === 'rods'}
      transform={`translate(0 ${-rodLift - domeLift * 0.55})`}
      role={interactive ? 'button' : undefined}
      tabindex={interactive ? 0 : undefined}
      aria-label={interactive ? parts.rods : undefined}
      on:click={() => pick('rods')}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick('rods'))}
    >
      {#each [130, 152, 174, 196] as x, i}
        <rect
          x={x - 5}
          y={70 + (i % 2) * 8}
          width="10"
          height={104 - (i % 2) * 8}
          rx="4"
          fill={`url(#${idPrefix}-steel-dark)`}
          fill-opacity={metal}
          stroke="var(--navy)"
          stroke-width="1.2"
        />
        <rect x={x - 11} y={60 + (i % 2) * 8} width="22" height="12" rx="3" fill={`url(#${idPrefix}-steel)`} fill-opacity={metal} stroke="var(--navy)" stroke-width="1.2" />
      {/each}
      <path d="M118 58 h84" stroke="var(--navy)" stroke-width="1.4" />
    </g>

    <!-- callout labels drawn on as the sequence runs -->
    <g class="labels" opacity={Math.max(0, Math.min(1, (p - 0.3) / 0.3))} font-size="10" fill="var(--ink-muted)" font-family="var(--font-body)">
      <path d="M226 120 h58" stroke="var(--rule-strong)" stroke-width="1" />
      <text x="288" y="123">Control rods</text>
      <path d="M40 196 h50" stroke="var(--rule-strong)" stroke-width="1" />
      <text x="4" y="192">Dome</text>
      <path d="M40 276 h82" stroke="var(--rule-strong)" stroke-width="1" />
      <text x="4" y="272">Core</text>
      <path d="M40 396 h28" stroke="var(--rule-strong)" stroke-width="1" />
      <text x="4" y="392">Base</text>
    </g>
  </svg>

  {#if interactive && activePart}
    <p class="partnote" aria-live="polite">{parts[activePart]}</p>
  {/if}

  <!-- every stage is available as plain written text -->
  <details class="plain">
    <summary>Read the reactor sequence as text</summary>
    <ol>
      <li>Whole: a metallic module, dome closed, control rods seated in the core.</li>
      <li>The control rods lift up and pull clear of the core.</li>
      <li>The rounded dome rises off the pressure vessel.</li>
      <li>The core is laid bare: a dark column of coated particle fuel held in graphite.</li>
      <li>The metal resolves into a clean technical line drawing, labelled part by part.</li>
    </ol>
    <p class="small">
      High-temperature gas-cooled reactor. 250 MW thermal a module. 750 degrees Celsius at the
      outlet. Helium leaves the core through the hot duct to the heat interface and is returned by
      the circulator in the base.
    </p>
  </details>
</div>

<style>
  .reactor {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .svg {
    max-width: 100%;
    height: auto;
    overflow: visible;
  }
  .part {
    outline: none;
  }
  .part[role='button'] {
    cursor: pointer;
  }
  .part[role='button']:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
  .part.active {
    filter: drop-shadow(0 0 3px var(--accent));
  }
  .partnote {
    margin: 10px 0 0;
    font-size: 0.9rem;
    color: var(--ink-muted);
    text-align: center;
    max-width: 44ch;
  }
  .plain {
    margin-top: 14px;
    font-size: 0.9rem;
    color: var(--ink-muted);
    max-width: 60ch;
  }
  .plain summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--accent);
  }
  .plain ol {
    padding-left: 20px;
  }
</style>
