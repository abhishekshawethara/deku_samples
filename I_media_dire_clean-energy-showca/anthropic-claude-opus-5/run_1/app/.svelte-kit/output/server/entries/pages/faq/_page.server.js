import { c as copyFor, g as getData } from "../../../chunks/data.js";
async function load() {
  const [copy, faqs] = await Promise.all([copyFor("faq"), getData("/api/faqs")]);
  return { copy, faqs };
}
export {
  load
};
