import * as universal from '../entries/pages/faq/_page.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/faq/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/faq/+page.js";
export const imports = ["_app/immutable/nodes/10.BWY0t3Lq.js","_app/immutable/chunks/ChVoEOAQ.js","_app/immutable/chunks/D43MRvfz.js","_app/immutable/chunks/DMoS_FMk.js","_app/immutable/chunks/ftD27KfK.js","_app/immutable/chunks/D2vNiVY0.js","_app/immutable/chunks/C-GWtsQU.js","_app/immutable/chunks/r1bzutic.js","_app/immutable/chunks/BBM5_yTk.js","_app/immutable/chunks/Bh7MOdNg.js","_app/immutable/chunks/OA8UcISh.js","_app/immutable/chunks/BSeb6kpB.js","_app/immutable/chunks/GeDszscI.js"];
export const stylesheets = ["_app/immutable/assets/10.C0M1OLmu.css"];
export const fonts = [];
