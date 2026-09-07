import { c as copyFor, g as getData } from "../../../chunks/data.js";
async function load() {
  const [copy, offices] = await Promise.all([
    copyFor("company"),
    getData("/api/offices")
  ]);
  return { copy, offices };
}
export {
  load
};
