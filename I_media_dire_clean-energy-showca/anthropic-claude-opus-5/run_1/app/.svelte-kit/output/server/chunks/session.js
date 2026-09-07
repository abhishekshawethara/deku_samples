import { w as writable } from "./index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils2.js";
import "@sveltejs/kit/internal/server";
import "./root.js";
import "./state.svelte.js";
import "./api.js";
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
export {
  authReady as a,
  account as b
};
