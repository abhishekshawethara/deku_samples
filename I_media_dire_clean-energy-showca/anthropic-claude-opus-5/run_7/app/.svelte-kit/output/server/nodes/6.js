import * as universal from '../entries/pages/company/_page.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/company/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/company/+page.js";
export const imports = ["_app/immutable/nodes/6.COjsc63h.js","_app/immutable/chunks/DmEZAYAW.js","_app/immutable/chunks/Df3J8pHS.js","_app/immutable/chunks/DpEWzmlc.js","_app/immutable/chunks/C9MzMvTK.js","_app/immutable/chunks/Ba_76Q0t.js","_app/immutable/chunks/C6_9iCjx.js","_app/immutable/chunks/Bfh8xiOn.js","_app/immutable/chunks/DPlMZdl0.js","_app/immutable/chunks/CzzD1mKn.js","_app/immutable/chunks/B0s3C7QZ.js","_app/immutable/chunks/Cl3N8FSI.js","_app/immutable/chunks/CCq0vWBi.js","_app/immutable/chunks/BgmSy38A.js","_app/immutable/chunks/BvccGBzs.js","_app/immutable/chunks/B2Big82I.js"];
export const stylesheets = ["_app/immutable/assets/Plate.Dns5MnmN.css","_app/immutable/assets/6.DfbdCJRZ.css"];
export const fonts = [];
