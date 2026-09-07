import { d as derived, w as writable } from "./index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils2.js";
import "@sveltejs/kit/internal/server";
import "./root.js";
import "./state.svelte.js";
import "./auth.js";
const saves = writable([]);
const savesLoading = writable(false);
const savedSlugs = derived(saves, ($s) => new Set($s.map((r) => r.slug)));
derived(saves, ($s) => new Map($s.map((r) => [r.slug, r.id])));
export {
  saves as a,
  savedSlugs as b,
  savesLoading as s
};
