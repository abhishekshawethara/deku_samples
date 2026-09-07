import { l as loadJson } from "../../../chunks/load.js";
async function load({ fetch }) {
  const { data } = await loadJson(fetch, "/offices");
  return { offices: data };
}
export {
  load
};
