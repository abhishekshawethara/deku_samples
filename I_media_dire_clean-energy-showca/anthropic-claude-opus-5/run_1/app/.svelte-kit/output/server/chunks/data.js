function base() {
  return `http://127.0.0.1:${process.env.PORT || "4173"}`;
}
async function get(path) {
  const res = await globalThis.fetch(`${base()}${path}`);
  if (!res.ok) {
    const err = new Error(`API ${path} responded ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return { data: await res.json(), headers: res.headers };
}
async function getData(path) {
  const { data } = await get(path);
  return data;
}
async function copyFor(routeKey) {
  const rows = await getData(`/api/copy?route_key=${encodeURIComponent(routeKey)}`);
  const map = {};
  for (const row of rows) map[row.block_key] = row;
  return map;
}
export {
  get as a,
  copyFor as c,
  getData as g
};
