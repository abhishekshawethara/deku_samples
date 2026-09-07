import { c as copyFor, g as getData } from "../../../chunks/data.js";
async function load() {
  const [copy, team] = await Promise.all([copyFor("team"), getData("/api/team")]);
  return { copy, team };
}
export {
  load
};
