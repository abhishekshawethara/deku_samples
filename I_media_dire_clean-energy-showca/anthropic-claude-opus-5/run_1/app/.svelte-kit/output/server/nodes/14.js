import * as server from '../entries/pages/news/_slug_/_page.server.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/news/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/news/[slug]/+page.server.js";
export const imports = ["_app/immutable/nodes/14.DwvgnpsF.js","_app/immutable/chunks/BeLTFk-v.js","_app/immutable/chunks/hcWsK2WI.js","_app/immutable/chunks/DC54b-D4.js","_app/immutable/chunks/DpFiI5vR.js","_app/immutable/chunks/Ddr-T1j_.js","_app/immutable/chunks/RmW23hdw.js","_app/immutable/chunks/Be1MZO6_.js","_app/immutable/chunks/DRoQaABq.js","_app/immutable/chunks/CLiHNcxb.js","_app/immutable/chunks/O54SZt1H.js","_app/immutable/chunks/DJ1_xXRv.js","_app/immutable/chunks/x9unFnoE.js","_app/immutable/chunks/B8Z5lQpV.js"];
export const stylesheets = ["_app/immutable/assets/Plate.Cxcw6lM8.css","_app/immutable/assets/14.Cc3fNciO.css"];
export const fonts = [];
