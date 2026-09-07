<script>
	import { onMount } from 'svelte';
	import Reactor from '$lib/components/Reactor.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import { reveal, scrollProgress } from '$lib/scroll.js';

	export let data;

	const OUTPUTS = [
		{ label: 'Heat', kind: 'heat', note: 'Process heat that replaces fired duty on an industrial site.' },
		{
			label: 'Heat and power',
			kind: 'heat-and-power',
			note: 'One block feeding a steam network and an electrical bus at once.'
		},
		{ label: 'Hydrogen', kind: 'hydrogen', note: 'High temperature electrolysis at corridor and works scale.' },
		{ label: 'Electricity', kind: 'electricity', note: 'Firm megawatt hours behind the meter, day and night.' }
	];

	const FACTS = [
		'High-temperature gas-cooled reactor',
		'250 MW thermal a module',
		'750 degrees Celsius at the outlet'
	];

	let progress = 0;
	let hasScrolled = false;

	onMount(() => {
		const onScroll = () => {
			if (window.scrollY > 40) hasScrolled = true;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<svelte:head>
	<title>Zettajoule, Powering the World</title>
</svelte:head>

<!-- First screen: the reactor on the blue-to-cream wash -->
<section class="hero" use:scrollProgress={(p) => (progress = p)}>
	<div class="wrap hero-inner">
		<h1 class="display">Powering the World</h1>
		<div class="hero-reactor">
			<Reactor {progress} height={470} />
		</div>
		<p class="promise">
			Small high-temperature reactor modules that deliver clean heat, hydrogen and electricity to industry. We own
			them, run them and staff them; you buy the energy.
		</p>
		<div class="hero-actions row">
			<a class="btn" href="/solutions">Explore the solutions</a>
			<a class="btn btn-secondary" href="/technology">See the technology</a>
		</div>
	</div>
	{#if !hasScrolled}
		<div class="scroll-hint" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="26" height="26" focusable="false">
				<path d="M12 4v14M6 13l6 6 6-6" stroke="var(--ink-muted)" stroke-width="1.6" fill="none" />
			</svg>
		</div>
	{/if}
	<p class="visually-hidden">
		The reactor sequence in words: the module stands whole and metallic, then the control rods lift out, the dome
		rises off, the fuel core is laid bare, and the metal resolves into a technical line drawing. Every fact it shows
		is written out below.
	</p>
</section>

<!-- The key facts and the four outputs -->
<section class="section facts-band">
	<div class="wrap">
		<div class="split" use:reveal>
			<div>
				<p class="eyebrow">The module</p>
				<h2>One engineered object, built in series.</h2>
				<ul class="facts">
					{#each FACTS as fact}<li>{fact}</li>{/each}
				</ul>
			</div>
			<div>
				<p class="lede">
					Zettajoule is named for the unit of energy the world will need each year. A zettajoule is a thousand
					exajoules, and global primary energy demand already runs past six hundred exajoules a year and keeps
					climbing as electrification, hydrogen and desalination arrive together. Nothing that only makes
					electricity can meet that. Heat is more than half of it, and heat is what this module is for.
				</p>
				<p class="lede">
					So the company does not sell reactors. It owns the module, runs it, staffs it through its own
					Operations Academy, and sells the energy at the fence.
				</p>
			</div>
		</div>

		<h2 class="outputs-title" use:reveal>Four outputs, eight industries.</h2>
		<ul class="outputs" use:reveal>
			{#each OUTPUTS as out}
				<li>
					<a class="output" href={`/solutions?output_kind=${encodeURIComponent(out.kind)}`}>
						<span class="output-label">{out.label}</span>
						<span class="output-note">{out.note}</span>
						<span class="output-go" aria-hidden="true">
							<svg viewBox="0 0 20 20" width="16" height="16" focusable="false">
								<path d="M5 15L15 5M7 5h8v8" stroke="currentColor" stroke-width="1.8" fill="none" />
							</svg>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Industry cards -->
<section class="section industry-band">
	<div class="wrap">
		<div class="band-head" use:reveal>
			<div>
				<p class="eyebrow">Solutions</p>
				<h2>What this can power.</h2>
			</div>
			<a class="btn btn-secondary" href="/solutions">All eight industries</a>
		</div>
		<div class="cardrow">
			{#each data.solutions as s (s.slug)}
				<a class="industry-card" href={`/solutions/${s.slug}`}>
					<Plate seed={s.slug} ratio="4 / 3" kind="industry" />
					<h3>{s.industry}</h3>
					<p class="dense">{s.title}</p>
					<span class="tag">{s.output_kind}</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- The one inverted moment -->
<section class="section inverted heat-band">
	<div class="wrap">
		<p class="eyebrow" style="color:#9dc0ff">Unmatched heat</p>
		<h2 class="heat-line" use:reveal>750 degrees Celsius. A water cooled reactor stops at three hundred.</h2>
		<p class="lede" style="color:#cfc9c3; max-width:70ch">
			That difference is the whole company. Below three hundred degrees a reactor makes electricity and nothing
			else. Above seven hundred it drives chemical reformers, high temperature electrolysis, direct reduced iron
			and thermal desalination, work that cannot be done with a wire. The helium leaves the core at 750, and the
			jobs a nuclear plant can take change entirely.
		</p>
		<a class="btn btn-secondary heat-cta" href="/edge">Why we are different</a>
	</div>
</section>

<!-- Technology preview -->
<section class="section tech-band">
	<div class="wrap split" use:reveal>
		<div>
			<p class="eyebrow">Technology</p>
			<h2>Helium, graphite and a fuel that contains itself.</h2>
			<p class="lede">
				Tiny uranium grains wrapped in tough ceramic shells sit inside a graphite core, and helium carries the
				heat out. The coolant is chemically inert, stays a gas at every temperature the plant reaches, and does
				not attack anything it touches. A living digital copy of the reactor spots problems early and keeps
				costs down.
			</p>
			<a class="btn btn-secondary" href="/technology">Pick the reactor apart</a>
		</div>
		<div class="tech-plate"><Reactor progress={0.85} mode="diagram" height={340} /></div>
	</div>
</section>

<style>
/* the home route opens on a wash from a cool blue tint to a warm cream tint
   and settles to light grey */
.hero {
background: linear-gradient(180deg, #e6effb 0%, #f4ecdf 72%, var(--ground-soft) 100%);
padding: 56px 0 88px;
position: relative;
}
.hero-inner {
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
}
/* the single place the heading family runs at its lightest weight and largest size */
.display {
font-family: var(--font-heading);
font-weight: 200;
font-size: clamp(2.6rem, 9.5vw, 7.4rem);
letter-spacing: -0.045em;
line-height: 0.95;
margin: 0 0 -0.22em;
position: relative;
z-index: 2;
color: var(--ink);
}
.hero-reactor {
position: relative;
z-index: 1;
width: 100%;
}
.promise {
max-width: 58ch;
font-size: clamp(1rem, 1.7vw, 1.22rem);
color: var(--ink-muted);
margin-top: -10px;
}
.hero-actions {
justify-content: center;
margin-top: 8px;
}
.scroll-hint {
position: absolute;
left: 50%;
bottom: 18px;
transform: translateX(-50%);
}
.facts-band {
background: var(--ground-soft);
}
.split {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 40px;
align-items: start;
}
.facts {
list-style: none;
margin: 20px 0 0;
padding: 0;
display: flex;
flex-direction: column;
gap: 0;
}
.facts li {
border-top: 1px solid var(--rule-strong);
padding: 14px 0;
font-family: var(--font-heading);
font-weight: 800;
font-size: clamp(1.05rem, 2vw, 1.35rem);
}
.facts li:last-child {
border-bottom: 1px solid var(--rule-strong);
}
.outputs-title {
margin-top: 64px;
}
.outputs {
list-style: none;
margin: 0;
padding: 0;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
gap: 0;
border-top: 1px solid var(--rule-strong);
border-left: 1px solid var(--rule-strong);
}
.outputs li {
border-right: 1px solid var(--rule-strong);
border-bottom: 1px solid var(--rule-strong);
}
.output {
display: flex;
flex-direction: column;
gap: 8px;
padding: 22px 18px;
height: 100%;
text-decoration: none;
color: var(--ink);
background: #fff;
position: relative;
}
.output:hover {
background: var(--sky);
color: var(--accent-hover);
}
.output-label {
font-family: var(--font-heading);
font-weight: 800;
font-size: 1.35rem;
}
.output-note {
color: var(--ink-muted);
font-size: 0.92rem;
}
.output-go {
position: absolute;
top: 18px;
right: 16px;
color: var(--accent);
}
.band-head {
display: flex;
align-items: flex-end;
justify-content: space-between;
gap: 20px;
flex-wrap: wrap;
margin-bottom: 24px;
}
.cardrow {
display: grid;
grid-auto-flow: column;
grid-auto-columns: minmax(240px, 1fr);
gap: 18px;
overflow-x: auto;
padding-bottom: 12px;
scroll-snap-type: x mandatory;
}
.industry-card {
scroll-snap-align: start;
text-decoration: none;
color: var(--ink);
border: 1px solid var(--rule);
border-radius: var(--radius);
padding: 14px;
background: #fff;
}
.industry-card:hover {
border-color: var(--accent);
}
.industry-card h3 {
margin: 12px 0 4px;
font-size: 1.15rem;
}
.industry-card p {
color: var(--ink-muted);
margin-bottom: 10px;
}
.tag {
display: inline-block;
font-family: var(--font-mono);
font-size: 0.76rem;
border: 1px solid var(--rule-strong);
border-radius: 999px;
padding: 2px 9px;
color: var(--ink-muted);
}
.heat-band {
padding: 108px 0;
}
.heat-line {
max-width: 20ch;
font-size: clamp(2rem, 6vw, 4.2rem);
}
.heat-cta {
margin-top: 12px;
border-color: #9dc0ff;
color: #9dc0ff;
}
.heat-cta:hover {
background: rgba(157, 192, 255, 0.14);
color: #fff;
border-color: #fff;
}
.tech-plate {
background: linear-gradient(160deg, #eef4fd 0%, #ffffff 70%);
border: 1px solid var(--rule);
border-radius: var(--radius);
padding: 18px;
}
/* scroll-bound reveals: they land at once, nothing eases */
[data-revealed='false'] {
opacity: 0;
transform: translateY(18px);
}
@media (max-width: 700px) {
.cardrow {
grid-auto-columns: 86%;
}
}
</style>
