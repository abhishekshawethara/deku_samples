import { c as copyFor, g as getData } from "../../../chunks/data.js";
async function load() {
  const [copy, jobs] = await Promise.all([copyFor("careers"), getData("/api/jobs")]);
  return { copy, jobs };
}
export {
  load
};
