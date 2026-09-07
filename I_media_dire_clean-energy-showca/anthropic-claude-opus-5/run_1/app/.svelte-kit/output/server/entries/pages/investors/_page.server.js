import { c as copyFor, g as getData } from "../../../chunks/data.js";
async function load() {
  const [copy, roadmap] = await Promise.all([
    copyFor("investors"),
    getData("/api/roadmap")
  ]);
  return { copy, roadmap };
}
export {
  load
};
