import { error } from "@sveltejs/kit";
import { a as loadJson } from "../../../../chunks/ssr.js";
async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/stories/${encodeURIComponent(params.slug)}`);
    return { story: data };
  } catch {
    throw error(404, "We cannot find that page");
  }
}
export {
  load
};
