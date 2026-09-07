import { l as loadJsonOr } from "../../../chunks/ssr.js";
async function load({ fetch }) {
  return { team: await loadJsonOr(fetch, "/team", []) };
}
export {
  load
};
