import { error } from "@sveltejs/kit";
import { l as loadJson } from "../../../../chunks/load.js";
async function load({ fetch, params }) {
  try {
    const { data } = await loadJson(fetch, `/stories/${encodeURIComponent(params.slug)}`);
    return { story: data };
  } catch (e) {
    throw error(e.status === 404 ? 404 : 500, e.message);
  }
}
export {
  load
};
