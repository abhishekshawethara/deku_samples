<script>
  /** A generated gradient plate standing in for a photograph. No asset files ship. */
  export let seed = 'zettajoule';
  export let height = '160px';
  export let label = '';
  export let kind = 'industry'; // industry | portrait | ground

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  $: h = hash(seed);
  $: a = 195 + (h % 40); // stays inside the accent hue family
  $: b = 208 + ((h >> 5) % 34);
  $: ang = 110 + (h % 130);
  $: l1 = kind === 'portrait' ? 92 : 72 + (h % 12);
  $: l2 = kind === 'portrait' ? 82 : 44 + ((h >> 3) % 16);
  $: sat = kind === 'portrait' ? 42 : 34 + ((h >> 7) % 26);
</script>

<div
  class="plate {kind}"
  style={`height:${height};
    --g1:hsl(${a} ${sat}% ${l1}%);
    --g2:hsl(${b} ${sat}% ${l2}%);
    --ang:${ang}deg;
    --spot:${25 + (h % 50)}% ${20 + ((h >> 4) % 60)}%;`}
  role="img"
  aria-label={label || `Generated plate for ${seed}`}
>
  {#if kind === 'portrait'}
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <circle cx="50" cy="38" r="17" fill="rgba(255,255,255,0.62)" />
      <path d="M14 100 a36 30 0 0 1 72 0 z" fill="rgba(255,255,255,0.62)" />
    </svg>
  {:else if kind === 'industry'}
    <svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g stroke="rgba(255,255,255,0.5)" fill="none" stroke-width="1.2">
        <path d="M0 92 H200 M0 74 H200" />
        <rect x="24" y="42" width="34" height="50" />
        <rect x="72" y="28" width="22" height="64" />
        <circle cx="140" cy="58" r="20" />
        <path d="M140 38 v40 M120 58 h40" />
      </g>
    </svg>
  {/if}
</div>

<style>
  .plate {
    position: relative;
    width: 100%;
    border-radius: var(--radius);
    background:
      radial-gradient(60% 60% at var(--spot), rgba(255, 255, 255, 0.55), transparent 70%),
      linear-gradient(var(--ang), var(--g1), var(--g2));
    overflow: hidden;
    border: 1px solid var(--rule);
    -webkit-mask-image: radial-gradient(115% 115% at 50% 45%, #000 62%, rgba(0, 0, 0, 0.86) 100%);
    mask-image: radial-gradient(115% 115% at 50% 45%, #000 62%, rgba(0, 0, 0, 0.86) 100%);
  }
  .plate.portrait {
    background:
      radial-gradient(70% 70% at 50% 22%, #ffffff, transparent 72%),
      linear-gradient(var(--ang), var(--sky, #dbe9fb), var(--g1));
  }
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
</style>
