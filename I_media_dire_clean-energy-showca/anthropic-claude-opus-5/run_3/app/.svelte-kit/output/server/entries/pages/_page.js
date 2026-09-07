import { l as loadJson } from "../../chunks/load.js";
async function load({ fetch }) {
  const { data } = await loadJson(fetch, "/solutions");
  return { solutions: data };
}
export {
  load
};
