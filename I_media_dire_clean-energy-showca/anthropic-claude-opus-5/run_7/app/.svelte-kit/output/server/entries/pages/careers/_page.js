import { l as loadJsonOr } from "../../../chunks/ssr.js";
async function load({ fetch }) {
  return { jobs: await loadJsonOr(fetch, "/jobs", []) };
}
export {
  load
};
