import { n as noop } from './index.js-DtYBOeIk.js';
import './exports.js-8HOoaa4e.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-DzEA886G.js';

const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
const placeholder_url = "a:";
if (is_legacy) {
  ({
    url: new URL(placeholder_url)
  });
}
//# sourceMappingURL=state.svelte.js-DiBp0ONL.js.map
