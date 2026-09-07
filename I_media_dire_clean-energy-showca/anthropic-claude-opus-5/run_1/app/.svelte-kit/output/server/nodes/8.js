import * as server from '../entries/pages/contact/_page.server.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/contact/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/contact/+page.server.js";
export const imports = ["_app/immutable/nodes/8.CNV9t0F_.js","_app/immutable/chunks/BeLTFk-v.js","_app/immutable/chunks/hcWsK2WI.js","_app/immutable/chunks/DVpC-KkP.js","_app/immutable/chunks/x9unFnoE.js","_app/immutable/chunks/B8Z5lQpV.js","_app/immutable/chunks/DC54b-D4.js","_app/immutable/chunks/DpFiI5vR.js","_app/immutable/chunks/Ddr-T1j_.js","_app/immutable/chunks/RmW23hdw.js","_app/immutable/chunks/CUbmYtzY.js","_app/immutable/chunks/T0XCCiaI.js","_app/immutable/chunks/Csw6w-N1.js","_app/immutable/chunks/D1pUFZNq.js","_app/immutable/chunks/G2gSt9oK.js","_app/immutable/chunks/CPVh8qYM.js"];
export const stylesheets = ["_app/immutable/assets/8.BNxT18Hv.css"];
export const fonts = [];
