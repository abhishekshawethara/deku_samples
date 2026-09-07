import { a2 as noop } from './index.js-D2EWZzu8.js';
import './exports.js-8HOoaa4e.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-DYTbTUbw.js';

const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
const placeholder_url = "a:";
if (is_legacy) {
  ({
    url: new URL(placeholder_url)
  });
}
//# sourceMappingURL=state.svelte.js-CqN4U7qs.js.map
