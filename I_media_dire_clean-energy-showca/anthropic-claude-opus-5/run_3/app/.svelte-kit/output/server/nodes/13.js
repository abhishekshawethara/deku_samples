import * as universal from '../entries/pages/news/_page.js';

export const index = 13;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/news/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/news/+page.js";
export const imports = ["_app/immutable/nodes/13.ClEEAUsV.js","_app/immutable/chunks/ChVoEOAQ.js","_app/immutable/chunks/D43MRvfz.js","_app/immutable/chunks/DMoS_FMk.js","_app/immutable/chunks/ftD27KfK.js","_app/immutable/chunks/D2vNiVY0.js","_app/immutable/chunks/C-GWtsQU.js","_app/immutable/chunks/DPjy7dAL.js","_app/immutable/chunks/BIhcvOZk.js","_app/immutable/chunks/CS-Uh4U9.js","_app/immutable/chunks/CyJ5KgkG.js","_app/immutable/chunks/Ck8_gN3D.js","_app/immutable/chunks/BBM5_yTk.js","_app/immutable/chunks/Bh7MOdNg.js","_app/immutable/chunks/OA8UcISh.js","_app/immutable/chunks/BSeb6kpB.js","_app/immutable/chunks/GeDszscI.js"];
export const stylesheets = ["_app/immutable/assets/Plate.snX31VUA.css","_app/immutable/assets/Reveal.D_xQPw9d.css","_app/immutable/assets/13.D9cjj_Z8.css"];
export const fonts = [];
