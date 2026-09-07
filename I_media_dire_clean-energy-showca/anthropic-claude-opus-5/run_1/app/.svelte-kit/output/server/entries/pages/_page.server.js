import { c as copyFor, g as getData } from "../../chunks/data.js";
async function load() {
  const [copy, solutions] = await Promise.all([
    copyFor("home"),
    getData("/api/solutions")
  ]);
  return { copy, solutions };
}
export {
  load
};
