import { c as createComponent, m as maybeRenderHead, a as addAttribute, r as renderTemplate, b as createAstro } from './astro/server_DjxxgwXx.mjs';
import 'kleur/colors';
import 'clsx';
import { f as formatDate, b as formatBytes, N as NOTE_GROUPS } from './view_5k7OaDvH.mjs';
/* empty css                             */

const $$Astro = createAstro();
const $$ReleaseBlock = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ReleaseBlock;
  const { release, open } = Astro2.props;
  const notes = release.notes || {};
  return renderTemplate`<!--
  A disclosure that works with no scripting and is keyboard operable. The whole
  archive is present in the markup whatever the collapse state, so an in-page
  find and a crawler both see all of it.
-->${maybeRenderHead()}<details class="release"${addAttribute(open, "open")} data-astro-cid-7vmtfvrn> <summary data-astro-cid-7vmtfvrn> <span class="summary-face" data-astro-cid-7vmtfvrn> <span class="summary-main" data-astro-cid-7vmtfvrn> <span class="release-title" data-astro-cid-7vmtfvrn>Arranger ${release.version}</span> <span class="release-date xsmall muted" data-astro-cid-7vmtfvrn>Released on ${formatDate(release.released_on)}</span> </span> <span class="summary-marker" aria-hidden="true" data-astro-cid-7vmtfvrn></span> </span> </summary> <div class="release-body" data-astro-cid-7vmtfvrn> <div class="release-actions" data-astro-cid-7vmtfvrn> <a class="button button-quiet"${addAttribute(`/downloads/${release.version}`, "href")} data-astro-cid-7vmtfvrn>
Download ${release.artifact_name} </a> <span class="xsmall muted tnum" data-astro-cid-7vmtfvrn>${formatBytes(release.size_bytes)}</span> </div> <p class="digest xsmall muted" data-astro-cid-7vmtfvrn>${release.sha256}</p> ${release.description && renderTemplate`<p class="small description" data-astro-cid-7vmtfvrn>${release.description}</p>`} <!-- Four ordered groups only, each optional and none invented beyond those. --> ${NOTE_GROUPS.filter((g) => Array.isArray(notes[g]) && notes[g].length > 0).map((group) => renderTemplate`<section class="note-group" data-astro-cid-7vmtfvrn> <h3 data-astro-cid-7vmtfvrn>${group}</h3> <ul data-astro-cid-7vmtfvrn> ${notes[group].map((item) => renderTemplate`<li data-astro-cid-7vmtfvrn>${item}</li>`)} </ul> </section>`)} <p class="small signoff" data-astro-cid-7vmtfvrn>The Vela team.</p> </div> </details> `;
}, "/app/src/components/ReleaseBlock.astro", void 0);

export { $$ReleaseBlock as $ };
