/** Final audit: the copy deck, the route list and the exact API field names. */
const BASE = process.env.BASE || 'http://localhost:4173';
let pass = 0;
let fail = 0;
const bad = [];

function ok(name, cond, extra = '') {
  if (cond) {
    pass++;
  } else {
    fail++;
    bad.push(`${name} :: ${extra}`);
  }
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name + (cond ? '' : ` :: ${extra}`));
}

const text = async (p) => (await fetch(`${BASE}${p}`)).text();
const json = async (p, init) => {
  const r = await fetch(`${BASE}/api${p}`, init);
  return { status: r.status, body: await r.json().catch(() => null), headers: r.headers };
};

const keys = (o, list) => list.every((k) => Object.prototype.hasOwnProperty.call(o, k));

async function main() {
  console.log('\n== copy deck, exact strings ==');
  const home = await text('/');
  for (const s of ['Powering the World', 'Get in Touch', 'Heat and power', 'Hydrogen', 'Electricity']) {
    ok(`home carries "${s}"`, home.includes(s));
  }
  for (const s of [
    'High-temperature gas-cooled reactor',
    '250 MW thermal a module',
    '750 degrees Celsius at the outlet'
  ]) {
    ok(`the key fact "${s}" is present`, home.includes(s) || (await text('/technology')).includes(s));
  }
  const menu = ['Company', 'Technology', 'Solutions', 'Our Edge', 'Our Team', 'Investors', 'News', 'Careers', 'Contact'];
  ok('the nine menu labels are all in the bar', menu.every((m) => home.includes(`>${m}<`)), menu.filter((m) => !home.includes(`>${m}<`)).join(','));
  ok('company opening line', (await text('/company')).includes('clean heat and electricity to power a world of industrial applications'));
  ok('team opening line', (await text('/team')).includes('shaping the future of nuclear together'));
  ok('newsroom heading', (await text('/news')).includes('latest news'));
  ok('careers heading', (await text('/careers')).includes("help us build what's next in nuclear energy"));
  ok('not-found card copy', (await text('/nope-not-here')).includes('We cannot find that page'));

  console.log('\n== the nineteen routes answer, and nothing test or debug does ==');
  const routes = [
    '/', '/company', '/technology', '/edge', '/team', '/solutions', '/solutions/steel',
    '/compare', '/calculator', '/investors', '/news', '/news/first-module-order',
    '/careers', '/contact', '/faq', '/account', '/signin', '/signup'
  ];
  for (const r of routes) {
    const res = await fetch(`${BASE}${r}`);
    ok(`${r} answers 200`, res.status === 200, res.status);
  }
  {
    const res = await fetch(`${BASE}/investors/room`);
    ok('/investors/room answers (redirects or renders, never 500)', res.status < 500, res.status);
  }
  for (const r of ['/debug', '/test', '/__test', '/dev', '/admin']) {
    const res = await fetch(`${BASE}${r}`);
    ok(`no leftover route at ${r}`, res.status === 404, res.status);
  }

  console.log('\n== exact API field names ==');
  {
    const { body, headers } = await json('/solutions');
    ok(
      'solution carries the eight named fields',
      keys(body[0], ['slug', 'industry', 'title', 'summary', 'output_kind', 'temperature_band', 'deployment', 'module_count']),
      Object.keys(body[0]).join(',')
    );
    ok('X-Total-Count header present', !!headers.get('x-total-count'));
    ok('the list is a JSON array at the top level', Array.isArray(body));
  }
  {
    const { body } = await json('/solutions/steel');
    ok('one solution adds detail', keys(body, ['slug', 'detail', 'module_count']));
  }
  {
    const login = await json('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'visitor@example.com', password: 'deku-demo-pw-2026' })
    });
    ok('login returns access_token', typeof login.body.access_token === 'string');
    const tok = login.body.access_token;
    const auth = { authorization: `Bearer ${tok}` };

    const saves = await json('/saves', { headers: auth });
    ok('a save carries id, solution_id and slug', keys(saves.body[0], ['id', 'solution_id', 'slug']), Object.keys(saves.body[0]).join(','));

    const searches = await json('/searches', { headers: auth });
    ok('a saved search carries id and name', keys(searches.body[0], ['id', 'name']));

    const ar = await json('/access-request', { headers: auth });
    ok('the access request carries reference, organisation, role_title and status', keys(ar.body, ['reference', 'organisation', 'role_title', 'status']));

    const docs = await json('/documents', { headers: auth });
    ok('a document carries slug, title, category and published_at', keys(docs.body[0], ['slug', 'title', 'category', 'published_at']));

    const me = await json('/accounts/me', { headers: auth });
    ok('accounts/me carries id, email and display_name', keys(me.body, ['id', 'email', 'display_name']));

    const apps = await json('/applications', { headers: auth });
    ok('an application carries id, job_slug and status', apps.body.length === 0 || keys(apps.body[0], ['id', 'job_slug', 'status']), JSON.stringify(Object.keys(apps.body[0] || {})));
  }
  {
    const { body, headers } = await json('/stories?limit=2');
    ok('a story carries slug, title, outlet, published_at and featured', keys(body[0], ['slug', 'title', 'outlet', 'published_at', 'featured']));
    ok('stories carry X-Total-Count', headers.get('x-total-count') === '7');
  }
  {
    const { body } = await json('/jobs');
    ok('a job carries slug, title, location, team and description', keys(body[0], ['slug', 'title', 'location', 'team', 'description']));
  }
  {
    const { body } = await json('/team');
    ok('a team member carries slug, name, role_title, bio and profile_url', keys(body[0], ['slug', 'name', 'role_title', 'bio', 'profile_url']));
  }
  {
    const { body } = await json('/offices');
    ok('an office carries city, country and role_label', keys(body[0], ['city', 'country', 'role_label']));
  }
  {
    const { body } = await json('/faqs');
    ok('a faq carries question, answer and category', keys(body[0], ['question', 'answer', 'category']));
  }
  {
    const { body } = await json('/calculator', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ need_mw: 251, kind: 'thermal' })
    });
    ok('the calculator returns the three named figures', keys(body, ['modules_required', 'annual_clean_energy_gwh', 'annual_co2_avoided_tonnes']));
  }

  console.log('\n== a business-rule violation is a client error carrying a reason ==');
  for (const [path, init, label] of [
    ['/compare?slugs=steel,mining,chemicals,transport,desalination', undefined, 'a fifth comparison'],
    ['/calculator', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"need_mw":0,"kind":"thermal"}' }, 'a need of zero']
  ]) {
    const { status, body } = await json(path, init);
    ok(`${label} is 4xx with a message naming the reason`, status >= 400 && status < 500 && typeof body?.message === 'string' && body.message.length > 10, `${status} ${JSON.stringify(body)}`);
  }

  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  if (fail) bad.forEach((b) => console.log('  - ' + b));
  process.exit(fail ? 1 : 0);
}

main();
