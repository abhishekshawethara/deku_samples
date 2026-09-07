import * as universal from '../entries/pages/_page.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.BN19FvEb.js","_app/immutable/chunks/ChVoEOAQ.js","_app/immutable/chunks/D43MRvfz.js","_app/immutable/chunks/DMoS_FMk.js","_app/immutable/chunks/CS-Uh4U9.js","_app/immutable/chunks/ftD27KfK.js","_app/immutable/chunks/D2vNiVY0.js","_app/immutable/chunks/CyJ5KgkG.js","_app/immutable/chunks/C-GWtsQU.js","_app/immutable/chunks/BIhcvOZk.js","_app/immutable/chunks/Ck8_gN3D.js","_app/immutable/chunks/DAeUW-SG.js","_app/immutable/chunks/DPjy7dAL.js"];
export const stylesheets = ["_app/immutable/assets/Reveal.D_xQPw9d.css","_app/immutable/assets/Reactor.BeCMvy8w.css","_app/immutable/assets/Plate.snX31VUA.css","_app/immutable/assets/2.2RSUwYif.css"];
export const fonts = [];
