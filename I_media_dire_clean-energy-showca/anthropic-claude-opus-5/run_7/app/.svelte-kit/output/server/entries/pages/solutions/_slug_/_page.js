import { error } from "@sveltejs/kit";
import { a as loadJson } from "../../../../chunks/ssr.js";
async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/solutions/${encodeURIComponent(params.slug)}`);
    return { solution: data };
  } catch (e) {
    throw error(404, "We cannot find that page");
  }
}
export {
  load
};
