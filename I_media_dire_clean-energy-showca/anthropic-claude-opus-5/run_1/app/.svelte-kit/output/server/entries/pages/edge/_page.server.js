import { c as copyFor } from "../../../chunks/data.js";
async function load() {
  return { copy: await copyFor("edge") };
}
export {
  load
};
