import bcrypt from 'bcryptjs';
import { query } from './db.js';

const SEED_PASSWORD = 'deku-demo-pw-2026';

const SOLUTIONS = [
  {
    slug: 'oil-and-gas',
    industry: 'Oil and Gas',
    title: 'Process heat for refining and upgrading',
    summary:
      'Replace fired heaters and gas boilers on refinery and upgrading sites with steady carbon free heat at refining temperatures.',
    detail:
      'Refineries and upgraders burn fuel gas to make the process heat that runs distillation, hydrotreating and steam generation. A cluster of four modules delivers that duty as helium heat through a steam interface, so the existing steam header keeps its pressure and temperature while its carbon disappears. The reactor sits behind the fence line, is owned, operated and staffed by Zettajoule, and the site buys the energy against a long term contract. The interface is deliberately dull: a helium to steam exchanger, an isolation loop and the same distributed control system tags the operators already read. Because the modules are built in a factory and finished on site, an added train does not mean an added construction programme.',
    output_kind: 'heat',
    temperature_band: '250 to 550 C',
    deployment: 'multi-module',
    module_count: 4
  },
  {
    slug: 'chemicals',
    industry: 'Chemicals',
    title: 'Heat and power for chemical complexes',
    summary:
      'One plant covering both the high grade heat and the electrical load of a chemical complex, from cracking support to compression.',
    detail:
      'A chemical complex is two energy problems wearing one coat: a very large heat demand at temperature and a very large electrical demand for compression and separation. Three modules cover both, taking helium at 750 degrees Celsius to the steam and power island and splitting the output to follow the plant rather than the grid. Ammonia, methanol and olefins plants all sit inside the band this reactor serves. The energy is sold as a service, so the operator carries no nuclear licence, no fuel procurement and no operations staffing: those stay with Zettajoule for the life of the plant.',
    output_kind: 'heat-and-power',
    temperature_band: '550 to 750 C',
    deployment: 'multi-module',
    module_count: 3
  },
  {
    slug: 'transport',
    industry: 'Transport',
    title: 'Hydrogen for heavy transport corridors',
    summary:
      'High temperature hydrogen production for road freight, shipping and aviation fuel synthesis along a single corridor.',
    detail:
      'Heavy transport cannot be run from a battery at the weights and ranges it works to, so it needs a molecule. Six modules feeding high temperature electrolysis lift the efficiency of hydrogen production well past cold electrolysis, because part of the energy of splitting water arrives as heat rather than as electricity. The hydrogen goes straight into fuelling for freight, into ammonia for shipping or into synthetic aviation fuel. A corridor plant is sized to its offtake and grows a module at a time as the fleet converts, which is the whole point of building small and repeating.',
    output_kind: 'hydrogen',
    temperature_band: '550 to 750 C',
    deployment: 'multi-module',
    module_count: 6
  },
  {
    slug: 'steel',
    industry: 'Steel',
    title: 'Hydrogen for direct reduced iron',
    summary:
      'Carbon free hydrogen and process heat at the scale a direct reduction shaft needs to leave coal behind.',
    detail:
      'The hydrogen route to steel replaces coke with hydrogen in a direct reduction shaft, and the constraint has always been where that hydrogen comes from at mill scale and mill reliability. Eight modules feed high temperature electrolysis alongside the process heat the shaft and the downstream electric arc furnace want, on the mill site, running the same hours the mill runs. The result is a supply that does not stop when the wind does and does not need a grid connection sized for the whole mill. This is the single largest industrial use of the hydrogen output kind, and it is the one that has to work first.',
    output_kind: 'hydrogen',
    temperature_band: '550 to 750 C',
    deployment: 'multi-module',
    module_count: 8
  },
  {
    slug: 'mining',
    industry: 'Mining',
    title: 'Firm power for remote mine sites',
    summary:
      'A single module replacing diesel generation at a remote mine, with no fuel convoy and no grid connection.',
    detail:
      'Remote mines run on diesel trucked in over long distances, which is expensive, dirty and fragile. One module produces 100 MW electrical continuously for years between refuellings, covering the mill, the hoists, the ventilation and the camp. Because the plant is a single module it can be sited, licensed and operated as one unit, and because Zettajoule owns and staffs it the mine keeps its own people on mining. The site buys energy at a known price for the life of the mine, which takes the fuel market out of the mine plan entirely.',
    output_kind: 'electricity',
    temperature_band: 'up to 250 C',
    deployment: 'single-module',
    module_count: 1
  },
  {
    slug: 'data-centres',
    industry: 'Data Centres',
    title: 'Round the clock power for compute campuses',
    summary:
      'Two modules matched to a campus load, delivering firm carbon free electricity behind the meter.',
    detail:
      'A compute campus wants power that is firm, clean and close, and it wants it faster than a transmission upgrade can be built. Two modules behind the meter deliver 200 MW electrical continuously, with the reject heat available for district heating or for absorption cooling on the same campus. The load profile is flat, which is exactly what a high temperature gas cooled reactor is happiest running against. Siting is straightforward because the plant is small, walkaway safe by physics rather than by pumps, and needs no large body of cooling water.',
    output_kind: 'electricity',
    temperature_band: 'up to 250 C',
    deployment: 'single-module',
    module_count: 2
  },
  {
    slug: 'communities',
    industry: 'Communities',
    title: 'District heat and power for towns',
    summary:
      'One module supplying a district heating network and its local electrical demand from the same plant.',
    detail:
      'District heating networks in northern cities still burn gas, waste or biomass to make hot water. A single module supplies the network at the temperature it already runs and sells the balance of its output as electricity into the local system. The plant is small enough to sit inside an industrial estate, quiet, with no plume and no fuel deliveries, and the network sees a heat price fixed for decades instead of one that follows the gas market. Communities buy heat and power, not a reactor: the licence, the staffing and the operations stay with Zettajoule.',
    output_kind: 'heat-and-power',
    temperature_band: 'up to 250 C',
    deployment: 'single-module',
    module_count: 1
  },
  {
    slug: 'desalination',
    industry: 'Desalination',
    title: 'Thermal desalination at coastal scale',
    summary:
      'Two modules driving multi effect distillation, turning seawater into fresh water without burning anything.',
    detail:
      'Thermal desalination wants a large quantity of moderate temperature heat, which is the cheapest thing a reactor makes. Two modules drive multi effect distillation or a hybrid thermal and membrane plant, with the electrical balance running the high pressure pumps. Coastal siting suits a plant that needs seawater anyway, and the modular build lets the water plant grow with the city rather than being built once at full size and then run part loaded for a decade. Water and energy are the same problem in the Gulf, and this is the shape of a plant that solves both.',
    output_kind: 'heat',
    temperature_band: '250 to 550 C',
    deployment: 'single-module',
    module_count: 2
  }
];

const DOCUMENTS = [
  {
    slug: 'investor-deck-2026',
    title: 'Investor Deck 2026',
    category: 'Financials',
    summary:
      'The current round deck: market, module economics, contracted pipeline and the use of proceeds.',
    published_at: '2026-06-01'
  },
  {
    slug: 'technology-dossier',
    title: 'Technology Dossier',
    category: 'Technology',
    summary:
      'Fuel, moderator, coolant and the module architecture, with the test reactor operating record behind it.',
    published_at: '2026-04-12'
  },
  {
    slug: 'licensing-roadmap',
    title: 'Licensing Roadmap',
    category: 'Regulatory',
    summary:
      'The regulatory path in each target jurisdiction, with dates, dependencies and the evidence base.',
    published_at: '2026-02-20'
  }
];

const JOBS = [
  {
    slug: 'reactor-systems-engineer',
    title: 'Reactor Systems Engineer',
    location: 'Rotterdam',
    team: 'Engineering',
    description:
      'Own the primary helium circuit from the core outlet to the heat interface: sizing, transients, and the analysis that carries a licence. You will work against the operating record of a test reactor rather than against a blank sheet, and you will be expected to say plainly when the data does not support the claim.'
  },
  {
    slug: 'licensing-lead',
    title: 'Licensing Lead',
    location: 'Chicago',
    team: 'Regulatory',
    description:
      'Carry the submission in one jurisdiction end to end, and keep the safety case honest while doing it. This is a role for somebody who has been through a regulatory review before and knows how much of the work is writing clearly.'
  },
  {
    slug: 'operations-trainer',
    title: 'Operations Trainer',
    location: 'Rotterdam',
    team: 'Operations Academy',
    description:
      'Build and run the training programme that staffs the reactors we own. You will write the simulator scenarios, take the first cohorts through them, and be the reason a customer never has to hire a nuclear operator.'
  }
];

const STORIES = [
  {
    slug: 'first-module-order',
    title: 'First module order signed',
    outlet: 'Company news',
    published_at: '2026-08-18',
    featured: true,
    body: 'Zettajoule has signed its first firm order for a module, with delivery into an industrial cluster and an energy supply agreement running twenty years from first heat. The customer buys energy, not a reactor: the module is owned, operated and staffed by Zettajoule for the life of the contract, and the site sees only a steam header at the temperature and pressure it already runs.\n\nThe order follows two years of interface engineering with the site team and the completion of the helium loop endurance run earlier in the summer. Long lead items for the pressure vessel and the intermediate heat exchanger have been released, and fuel qualification continues on the schedule set out in the licensing roadmap.\n\n"An order is the only review that counts," said Mira Halvorsen, Chief Executive. "It says somebody with a plant to run has read our numbers and decided to plan around them."'
  },
  {
    slug: 'helium-loop-milestone',
    title: 'Helium loop completes a 1000 hour run',
    outlet: 'Company news',
    published_at: '2026-07-02',
    featured: false,
    body: 'The company helium test loop has completed a continuous thousand hour run at full outlet temperature, holding 750 degrees Celsius at the loop outlet across the whole campaign with no unplanned shutdown and no measurable degradation in the intermediate heat exchanger.\n\nThe run was designed to answer the question customers ask first: does the hot side hold. Instrumentation across the exchanger, the hot duct and the circulator was logged continuously and the data set is now part of the technology dossier available in the investor document room.\n\nThe loop has been returned to service for the next campaign, which introduces deliberate thermal cycling to represent an industrial load that follows a plant rather than a grid.'
  },
  {
    slug: 'steel-partnership',
    title: 'Steel partnership targets the hydrogen route',
    outlet: 'Industry Week',
    published_at: '2026-05-14',
    featured: false,
    body: 'A European steelmaker and Zettajoule have agreed to study an eight module plant supplying hydrogen and process heat to a direct reduction shaft, with the aim of taking coke out of the route entirely.\n\nThe attraction of high temperature nuclear heat in this application is efficiency: high temperature electrolysis takes part of the energy of splitting water as heat rather than as electricity, so the same hydrogen costs less to make. The study will size the plant against the mill operating profile and test the interface against the existing gas network on site.\n\nThe steel industry accounts for a substantial share of global industrial emissions, and the hydrogen route is the only decarbonisation path that scales to primary production.'
  },
  {
    slug: 'licensing-step-cleared',
    title: 'Licensing step cleared',
    outlet: 'Energy Monitor',
    published_at: '2026-03-09',
    featured: false,
    body: 'The regulator has closed out the first formal step of the pre-application review, accepting the fuel qualification basis and the approach to the safety case built on the operating record of an existing test reactor.\n\nBuilding on a reactor that already exists, rather than on a paper concept, has been the company argument from the start, and it is the argument that carried this step. The next milestone is the topical report on the intermediate heat exchanger, which is scheduled for submission before the end of the year.\n\nLicensing lead Anneke Vos said the review had been demanding and useful in equal measure, and that the questions asked were the ones the team had expected.'
  },
  {
    slug: 'academy-first-cohort',
    title: 'Operations Academy takes its first cohort',
    outlet: 'Company news',
    published_at: '2026-02-11',
    featured: false,
    body: 'The Operations Academy has taken its first cohort of trainee operators in Rotterdam, beginning an eighteen month programme of classroom work, simulator time and secondments to operating plants.\n\nThe academy exists because of the business model: Zettajoule owns and staffs the reactors it sells energy from, so it has to be able to produce operators at the rate it produces modules. The first cohort is deliberately mixed, drawing from process industry operators, marine engineers and recent graduates.\n\nDaniel Okoye, who runs the academy, said the intake had been oversubscribed by a wide margin and that a second cohort would start before the end of the year.'
  },
  {
    slug: 'desalination-study',
    title: 'Desalination study opens in the Gulf',
    outlet: 'Water Report',
    published_at: '2026-01-20',
    featured: false,
    body: 'A feasibility study has opened on a two module plant driving multi effect distillation on a Gulf coast site, coupling water production to firm carbon free energy.\n\nWater and energy are the same problem in the region: desalination is one of the largest single electrical and thermal loads in several national systems, and it currently runs on gas. A reactor that produces moderate temperature heat cheaply is a natural fit, and the modular build lets the water plant follow demand growth instead of being built once at full size.\n\nThe study will report before the end of the year and covers siting, seawater intake, the thermal interface and the regulatory route.'
  },
  {
    slug: 'helium-supply-signed',
    title: 'Helium supply agreement signed',
    outlet: 'Company news',
    published_at: '2025-11-05',
    featured: false,
    body: 'Zettajoule has signed a multi year helium supply agreement covering the test loop programme and the first module inventories, removing a supply question that sits behind every gas cooled design.\n\nHelium is chemically inert, does not become strongly radioactive in the core and stays a gas at every temperature the reactor sees, which is why it is the coolant. It is also a globally traded commodity with a history of tight markets, so securing supply early is part of engineering rather than procurement housekeeping.\n\nThe agreement covers first fills and make up volumes through the first deployments.'
  }
];

const TEAM = [
  {
    slug: 'mira-halvorsen',
    name: 'Mira Halvorsen',
    role_title: 'Chief Executive',
    bio: 'Mira has spent twenty five years in industrial energy, most of it selling heat rather than hardware, and came to nuclear because it was the only supply that met the temperature and the carbon target at the same time. She led the commercial function at a large European utility before founding Zettajoule, and she is the reason the company sells energy as a service rather than reactors as a product. She is a stand-in name for a stand-in portrait: the role is real, the person is illustrative.',
    profile_url: 'https://example.com/profiles/mira-halvorsen',
    sort_order: 1
  },
  {
    slug: 'tobias-ruiz',
    name: 'Tobias Ruiz',
    role_title: 'Chief Technology Officer',
    bio: 'Tobias is a thermal hydraulics engineer who worked on high temperature gas cooled systems for most of his career, including several years around an operating test reactor. He holds the line that the design is a modernisation of a machine that already ran rather than an invention, and he insists every claim on this site traces to a measurement. He is a stand-in name for a stand-in portrait: the role is real, the person is illustrative.',
    profile_url: 'https://example.com/profiles/tobias-ruiz',
    sort_order: 2
  },
  {
    slug: 'anneke-vos',
    name: 'Anneke Vos',
    role_title: 'Head of Licensing',
    bio: 'Anneke has taken two reactor designs through regulatory review in two jurisdictions and knows how much of that work is writing plainly about uncertainty. She runs the licensing roadmap, keeps the safety case honest, and is the person who says no when the schedule and the evidence disagree. She is a stand-in name for a stand-in portrait: the role is real, the person is illustrative.',
    profile_url: 'https://example.com/profiles/anneke-vos',
    sort_order: 3
  },
  {
    slug: 'daniel-okoye',
    name: 'Daniel Okoye',
    role_title: 'Head of Operations Academy',
    bio: 'Daniel built operator training programmes for process plants across three continents before joining to set up the Operations Academy. Because Zettajoule staffs the reactors it owns, his job is the constraint on how fast the company can grow, and he treats it that way. He is a stand-in name for a stand-in portrait: the role is real, the person is illustrative.',
    profile_url: 'https://example.com/profiles/daniel-okoye',
    sort_order: 4
  }
];

const OFFICES = [
  { city: 'Rotterdam', country: 'Netherlands', role_label: 'Headquarters' },
  { city: 'Chicago', country: 'United States', role_label: 'Licensing' },
  { city: 'Tokyo', country: 'Japan', role_label: 'Engineering' }
];

const FAQS = [
  {
    question: 'What kind of reactor is this?',
    answer:
      'A high-temperature gas-cooled reactor. Helium carries the heat, graphite surrounds the fuel, and the fuel itself is tiny uranium grains wrapped in tough ceramic shells that hold together at extreme heat. Each module delivers 250 MW thermal and 750 degrees Celsius at the outlet.',
    category: 'Technology',
    sort_order: 1
  },
  {
    question: 'Why does the outlet temperature matter so much?',
    answer:
      'Ordinary water-cooled reactors top out around 300 degrees Celsius, which is enough to make electricity and very little else. At 750 degrees Celsius the same machine can drive chemical processes, high temperature electrolysis and refining duties that a water-cooled plant simply cannot reach.',
    category: 'Technology',
    sort_order: 2
  },
  {
    question: 'How is the fuel able to survive an accident?',
    answer:
      'Each uranium grain is coated in layers of carbon and silicon carbide that act as its own containment and stay intact far above any temperature the reactor can reach, even with all cooling removed. Safety here is a property of the fuel and the physics rather than of pumps that must keep running.',
    category: 'Technology',
    sort_order: 3
  },
  {
    question: 'Do we have to buy and operate the reactor?',
    answer:
      'No. Zettajoule owns the plant, runs it and staffs it with operators trained in its own Operations Academy. The customer buys heat, hydrogen or electricity against a long term energy supply agreement and holds no nuclear licence.',
    category: 'Deployment',
    sort_order: 1
  },
  {
    question: 'How long does a deployment take?',
    answer:
      'Modules are built in a factory and finished on site, so the programme is dominated by licensing and site works rather than by construction of the reactor itself. A site that needs more energy later adds a module instead of starting a new project.',
    category: 'Deployment',
    sort_order: 2
  },
  {
    question: 'How much land and water does a module need?',
    answer:
      'Far less than a conventional plant. A single module is compact enough to sit inside an existing industrial estate, needs no large body of cooling water because the primary coolant is gas, and has no plume and no fuel deliveries beyond a refuelling every several years.',
    category: 'Deployment',
    sort_order: 3
  }
];

async function upsertList(table, columns, conflict, rows) {
  for (const row of rows) {
    const cols = columns.join(', ');
    const params = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updates = columns
      .filter((c) => c !== conflict)
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(', ');
    await query(
      `INSERT INTO ${table} (${cols}) VALUES (${params})
       ON CONFLICT (${conflict}) DO UPDATE SET ${updates}`,
      columns.map((c) => row[c])
    );
  }
}

export async function seed() {
  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const acc of [
    { email: 'visitor@example.com', display_name: 'Ada Moreau' },
    { email: 'visitor2@example.com', display_name: 'Ken Adeyemi' }
  ]) {
    await query(
      `INSERT INTO accounts (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name`,
      [acc.email, hash, acc.display_name]
    );
  }

  let order = 0;
  for (const s of SOLUTIONS) {
    order += 1;
    await query(
      `INSERT INTO solutions (slug, industry, title, summary, detail, output_kind, temperature_band, deployment, module_count, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (slug) DO UPDATE SET industry=EXCLUDED.industry, title=EXCLUDED.title,
         summary=EXCLUDED.summary, detail=EXCLUDED.detail, output_kind=EXCLUDED.output_kind,
         temperature_band=EXCLUDED.temperature_band, deployment=EXCLUDED.deployment,
         module_count=EXCLUDED.module_count, sort_order=EXCLUDED.sort_order`,
      [
        s.slug,
        s.industry,
        s.title,
        s.summary,
        s.detail,
        s.output_kind,
        s.temperature_band,
        s.deployment,
        s.module_count,
        order
      ]
    );
  }

  await upsertList(
    'documents',
    ['slug', 'title', 'category', 'summary', 'published_at'],
    'slug',
    DOCUMENTS
  );
  await upsertList('jobs', ['slug', 'title', 'location', 'team', 'description'], 'slug', JOBS);
  await upsertList(
    'stories',
    ['slug', 'title', 'outlet', 'published_at', 'featured', 'body'],
    'slug',
    STORIES
  );
  await upsertList(
    'team_members',
    ['slug', 'name', 'role_title', 'bio', 'profile_url', 'sort_order'],
    'slug',
    TEAM
  );
  await upsertList('offices', ['city', 'country', 'role_label'], 'city', OFFICES);
  await upsertList('faqs', ['question', 'answer', 'category', 'sort_order'], 'question', FAQS);

  const ids = {};
  for (const email of ['visitor@example.com', 'visitor2@example.com']) {
    const r = await query('SELECT id FROM accounts WHERE email = $1', [email]);
    ids[email] = r.rows[0].id;
  }
  const solIds = {};
  for (const r of (await query('SELECT id, slug FROM solutions')).rows) solIds[r.slug] = r.id;

  const saves = [
    ['visitor@example.com', 'steel'],
    ['visitor@example.com', 'data-centres'],
    ['visitor2@example.com', 'mining']
  ];
  for (const [email, slug] of saves) {
    await query(
      `INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
       ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING`,
      [ids[email], solIds[slug]]
    );
  }

  await query(
    `INSERT INTO saved_searches (account_id, name, query, output_kind)
     VALUES ($1, 'Hydrogen sites', '', 'hydrogen')
     ON CONFLICT (account_id, name) DO UPDATE SET output_kind = EXCLUDED.output_kind`,
    [ids['visitor@example.com']]
  );

  const enquiries = [
    {
      reference: 'ENQ-7K2M9QD4',
      email: 'visitor@example.com',
      name: 'Ada Moreau',
      topic: 'Investor relations',
      status: 'answered',
      message:
        'We are assessing high temperature nuclear heat for a chemicals cluster and would like to discuss the investment case and the licensing timeline.'
    },
    {
      reference: 'ENQ-5R8X1CJ2',
      email: 'visitor2@example.com',
      name: 'Ken Adeyemi',
      topic: 'Careers',
      status: 'received',
      message:
        'I am a process operator with twelve years on a refinery and would like to know when the next Operations Academy cohort opens.'
    }
  ];
  for (const e of enquiries) {
    await query(
      `INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (reference) DO NOTHING`,
      [e.reference, ids[e.email], e.name, e.email, '+31', '105551234', e.topic, e.message, e.status]
    );
  }

  const accessRequests = [
    {
      reference: 'IAR-4H7N2PQ8',
      email: 'visitor@example.com',
      organisation: 'Moreau Industrial Capital',
      role_title: 'Managing Partner',
      status: 'approved'
    },
    {
      reference: 'IAR-9T3V6BLM',
      email: 'visitor2@example.com',
      organisation: 'Adeyemi Energy Partners',
      role_title: 'Principal',
      status: 'pending'
    }
  ];
  for (const a of accessRequests) {
    await query(
      `INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (account_id) DO NOTHING`,
      [a.reference, ids[a.email], a.organisation, a.role_title, a.status]
    );
  }
}
