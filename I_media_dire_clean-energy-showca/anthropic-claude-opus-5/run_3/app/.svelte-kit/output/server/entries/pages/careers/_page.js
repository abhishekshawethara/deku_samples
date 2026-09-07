import { l as loadJson } from "../../../chunks/load.js";
async function load({ fetch }) {
  const { data } = await loadJson(fetch, "/jobs");
  return { jobs: data };
}
export {
  load
};
