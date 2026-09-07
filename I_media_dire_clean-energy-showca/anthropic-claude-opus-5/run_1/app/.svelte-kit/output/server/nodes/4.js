import * as server from '../entries/pages/calculator/_page.server.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/calculator/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/calculator/+page.server.js";
export const imports = ["_app/immutable/nodes/4.BBCOoBhY.js","_app/immutable/chunks/BeLTFk-v.js","_app/immutable/chunks/hcWsK2WI.js","_app/immutable/chunks/DC54b-D4.js","_app/immutable/chunks/DpFiI5vR.js","_app/immutable/chunks/Ddr-T1j_.js","_app/immutable/chunks/RmW23hdw.js","_app/immutable/chunks/O54SZt1H.js","_app/immutable/chunks/CLiHNcxb.js","_app/immutable/chunks/CUbmYtzY.js","_app/immutable/chunks/G2gSt9oK.js"];
export const stylesheets = ["_app/immutable/assets/4.YeL6BLio.css"];
export const fonts = [];
