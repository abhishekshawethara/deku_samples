import { w as writable, d as derived } from './index2.js-Bm-nwO79.js';

const TOKEN_KEY = "zj_token";
const ACCOUNT_KEY = "zj_account";
const SAVE_KEY = "zj_save_token";
function persisted(key, initial, { json = false } = {}) {
  let start = initial;
  const store = writable(start);
  return store;
}
const token = persisted(TOKEN_KEY, null);
const account = persisted(ACCOUNT_KEY, null, { json: true });
const saveTokenStore = persisted(SAVE_KEY, null);
const isSignedIn = derived(token, ($t) => Boolean($t));

export { account as a, isSignedIn as i, saveTokenStore as s, token as t };
//# sourceMappingURL=auth.js-CRCsruHm.js.map
