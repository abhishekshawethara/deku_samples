import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.CHYQ9I_a.js","_app/immutable/chunks/D43MRvfz.js","_app/immutable/chunks/DMoS_FMk.js","_app/immutable/chunks/CS-Uh4U9.js","_app/immutable/chunks/ZwMXkjWc.js","_app/immutable/chunks/ftD27KfK.js","_app/immutable/chunks/C-GWtsQU.js","_app/immutable/chunks/LR5ePjSA.js","_app/immutable/chunks/B4ua6r5z.js","_app/immutable/chunks/Bh7MOdNg.js","_app/immutable/chunks/OA8UcISh.js","_app/immutable/chunks/BSeb6kpB.js","_app/immutable/chunks/BIhcvOZk.js","_app/immutable/chunks/GeDszscI.js","_app/immutable/chunks/Ck8_gN3D.js"];
export const stylesheets = ["_app/immutable/assets/0.DoFN8roF.css"];
export const fonts = [];
