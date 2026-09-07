import { a4 as getContext } from './index.js-D2EWZzu8.js';
import './exports.js-8HOoaa4e.js';
import './utils2.js-BQzn9ikS.js';
import './utils.js-Bzpr6vQU.js';
import './root.js-DYTbTUbw.js';
import './state.svelte.js-CqN4U7qs.js';

const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const navigating = {
  subscribe(fn) {
    const store = getStores().navigating;
    return store.subscribe(fn);
  }
};

export { navigating as n, page as p };
//# sourceMappingURL=stores.js-Df_k4Qpr.js.map
