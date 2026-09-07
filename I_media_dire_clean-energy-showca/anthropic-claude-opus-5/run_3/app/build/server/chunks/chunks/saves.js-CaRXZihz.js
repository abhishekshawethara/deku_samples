import { w as writable, d as derived } from './index2.js-Bm-nwO79.js';
import './exports.js-8HOoaa4e.js';
import './utils2.js-BQzn9ikS.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-GlEKx5p3.js';
import './state.svelte.js-CoYBmM9v.js';
import './auth.js-CRCsruHm.js';

const saves = writable([]);
const savesLoading = writable(false);
const savedSlugs = derived(saves, ($s) => new Set($s.map((r) => r.slug)));
derived(saves, ($s) => new Map($s.map((r) => [r.slug, r.id])));

export { savesLoading as a, savedSlugs as b, saves as s };
//# sourceMappingURL=saves.js-CaRXZihz.js.map
