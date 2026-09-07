import { w as writable } from './index2.js-DXE0eiF0.js';
import './exports.js-8HOoaa4e.js';
import './utils2.js-BQzn9ikS.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-DzEA886G.js';
import './state.svelte.js-DiBp0ONL.js';
import './api.js-LBSLTNEi.js';

function readLocal(key) {
  return null;
}
function writeLocal(key, value) {
  return;
}
const token = writable(readLocal());
const account = writable(null);
const authReady = writable(false);
const saveToken = writable(readLocal());
token.subscribe((v) => writeLocal());
saveToken.subscribe((v) => writeLocal());

export { authReady as a, account as b };
//# sourceMappingURL=session.js-EMz6Q6iE.js.map
