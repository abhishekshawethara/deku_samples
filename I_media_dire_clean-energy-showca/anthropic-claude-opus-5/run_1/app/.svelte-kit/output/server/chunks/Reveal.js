import { f as attr_class, c as attr_style } from "./index.js";
function Reveal($$renderer, $$props) {
  let { distance = 26, children, className = "" } = $$props;
  $$renderer.push(`<div${attr_class(`reveal ${className}`, "svelte-16jggtj")}${attr_style("", { "--distance": `${distance}px` })}><span class="clip svelte-16jggtj">`);
  children?.($$renderer);
  $$renderer.push(`<!----></span></div>`);
}
export {
  Reveal as R
};
