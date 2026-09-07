import "@sveltejs/kit";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
const ssr = false;
async function load({ fetch }) {
  return { documents: [] };
}
export {
  load,
  ssr
};
