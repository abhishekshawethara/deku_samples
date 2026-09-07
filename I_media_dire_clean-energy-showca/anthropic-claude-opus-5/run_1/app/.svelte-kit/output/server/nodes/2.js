import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.Bz3E6Ss9.js","_app/immutable/chunks/BeLTFk-v.js","_app/immutable/chunks/hcWsK2WI.js","_app/immutable/chunks/DVpC-KkP.js","_app/immutable/chunks/DC54b-D4.js","_app/immutable/chunks/DpFiI5vR.js","_app/immutable/chunks/Ddr-T1j_.js","_app/immutable/chunks/6-vPMY1B.js","_app/immutable/chunks/dHW5k7am.js","_app/immutable/chunks/DRoQaABq.js","_app/immutable/chunks/CLiHNcxb.js","_app/immutable/chunks/O54SZt1H.js","_app/immutable/chunks/DJ1_xXRv.js","_app/immutable/chunks/x9unFnoE.js","_app/immutable/chunks/B8Z5lQpV.js","_app/immutable/chunks/RmW23hdw.js","_app/immutable/chunks/DzrXpkIi.js","_app/immutable/chunks/Be1MZO6_.js"];
export const stylesheets = ["_app/immutable/assets/Reveal.DGYnBbPm.css","_app/immutable/assets/Reactor.DVrk1Ori.css","_app/immutable/assets/Plate.Cxcw6lM8.css","_app/immutable/assets/2.CSnSCUpb.css"];
export const fonts = [];
