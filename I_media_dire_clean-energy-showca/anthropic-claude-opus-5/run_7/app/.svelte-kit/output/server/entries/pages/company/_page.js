import { l as loadJsonOr } from "../../../chunks/ssr.js";
async function load({ fetch }) {
  return { offices: await loadJsonOr(fetch, "/offices", []) };
}
export {
  load
};
