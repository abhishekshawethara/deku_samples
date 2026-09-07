import bcrypt from 'bcryptjs';
import { pool } from './db.js';

export const DEMO_PASSWORD = 'deku-demo-pw-2026';

const SOLUTIONS = [
  {
    slug: 'oil-and-gas',
    industry: 'Oil and Gas',
    title: 'Process heat for refining and upgrading',
    summary:
      'Replace fired heaters and gas boilers with steady high-temperature process heat, cutting scope one emissions without touching the process itself.',
    detail:
      'Refineries and upgraders burn gas to make heat. A module delivers 250 MW thermal at a stable outlet temperature, so distillation columns, reboilers and hydrotreaters keep their duty while the flue stack goes quiet. We tie in at the steam header and the hot oil loop, so the plant keeps its existing control philosophy. A four module block carries a mid sized refinery through turnaround cycles, with modules staggered so heat never stops. We own the block, we run it, and the refinery buys heat by the gigajoule under a long term agreement.',
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
      'One block feeds the steam network and the electrical bus of a chemical complex at once, at temperatures a water cooled plant cannot reach.',
    detail:
      'Chemical complexes want both: high pressure steam for crackers and reformers, and firm electricity for compressors and separation. The helium loop leaves the core at 750 degrees Celsius, so a steam generator raises superheated steam while the balance of the heat drives a turbine. Three modules cover a typical integrated site with one module of margin for maintenance. Because the heat is carbon free at the point of use, the site keeps its product slate and loses its combustion emissions. Block by block we replace fired duty first, then the captive power station.',
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
      'High temperature heat plus electricity makes hydrogen far more efficiently than electrolysis alone, at the scale a freight corridor needs.',
    detail:
      'Heavy trucks, shipping and aviation fuels need hydrogen in volume. Feeding 750 degree heat into the electrolysis step lifts efficiency well past a cold stack, because part of the energy of splitting water arrives as heat rather than as electricity. Six modules anchor a corridor hub: hydrogen is produced continuously, compressed on site and dispatched to refuelling points along the route. The block runs at base load with no weather dependency, which is what a fuel supply contract requires. We own and operate the block and sell hydrogen at the fence.',
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
      'The hydrogen route to steel needs enormous, uninterrupted hydrogen supply and high grade heat. Eight modules deliver both on one site.',
    detail:
      'Direct reduction replaces coke with hydrogen, and the shaft furnace does not tolerate an interruption. Eight modules give a full scale plant firm hydrogen and the process heat the reduction gas preheater wants, from a footprint that fits inside the works fence. The temperature band matters: at 750 degrees the high temperature electrolysis step runs at a much better energy ratio than a cold stack, which is the difference between green steel that pencils out and green steel that does not. We build in modules so the plant converts one furnace at a time rather than all at once.',
    output_kind: 'hydrogen',
    temperature_band: '550 to 750 C',
    deployment: 'multi-module',
    module_count: 8
  },
  {
    slug: 'mining',
    industry: 'Mining',
    title: 'Firm electricity for remote mine sites',
    summary:
      'One module replaces a diesel farm at a remote pit, with fuel deliveries measured in years rather than weeks.',
    detail:
      'A remote mine runs on diesel trucked in over long haul roads, and the fuel bill follows the price of oil and the state of the road. A single module gives 100 MW electrical, firm, through the wet season and the dark months alike, with refuelling intervals measured in years. Mills, hoists, ventilation and the camp all sit on one bus. The module is delivered in transportable sections and commissioned on a prepared pad. We own it, we staff it through the Operations Academy, and the mine buys megawatt hours.',
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
      'Two modules carry a large campus at a constant carbon free output, behind the meter and independent of grid queues.',
    detail:
      'Compute campuses need power now, all day, every day, and the grid connection queue is measured in years. Two modules give 200 MW electrical behind the meter with an availability profile that matches the load rather than the weather, so no storage fleet has to be built to cover a still night. Waste heat is available for district use or for absorption cooling. Because we own and operate the plant, the campus signs an energy agreement rather than a nuclear licence, and its reported emissions fall to the carbon of construction alone.',
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
      'A single module warms a district network and feeds the local grid, replacing a gas fired heat plant on the same footprint.',
    detail:
      'District heating networks run on gas, and the heat plant sits inside the town it serves. One module supplies the network at the temperature the existing pipes were designed for, and sends the balance to the local grid as electricity. The plant is quiet, has no stack and no fuel deliveries by road, and its footprint is smaller than the boiler house it replaces. Heat price is fixed over the term of the agreement, which is what a municipality needs in order to plan. We own and staff the plant; the town buys heat and power.',
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
      'Two modules drive multi effect distillation with heat rather than electricity, producing fresh water at a fraction of the energy cost.',
    detail:
      'Membrane desalination pays for its water in electricity. Thermal desalination pays in heat, and heat is exactly what a module has in surplus. Two modules drive a multi effect distillation train in the 250 to 550 degree band, with the low grade tail of the cycle doing the evaporation work and the balance going to the plant electrical load. The result is fresh water at a lower energy cost per cubic metre and a brine management scheme designed in from the start. Coastal siting suits the modules, which reject heat to seawater.',
    output_kind: 'heat',
    temperature_band: '250 to 550 C',
    deployment: 'single-module',
    module_count: 2
  }
];

const DOCUMENTS = [
  { slug: 'investor-deck-2026', title: 'Investor Deck 2026', category: 'Financials', published_at: '2026-08-01' },
  { slug: 'technology-dossier', title: 'Technology Dossier', category: 'Technology', published_at: '2026-06-12' },
  { slug: 'licensing-roadmap', title: 'Licensing Roadmap', category: 'Regulatory', published_at: '2026-04-30' }
];

const JOBS = [
  {
    slug: 'reactor-systems-engineer',
    title: 'Reactor Systems Engineer',
    location: 'Rotterdam',
    team: 'Engineering',
    description:
      'Own the helium primary loop from the core outlet to the steam generator: sizing, transient behaviour, and the interfaces to the digital twin. You will work with the licensing team on the safety case and with the module factory on what can actually be built in series.'
  },
  {
    slug: 'licensing-lead',
    title: 'Licensing Lead',
    location: 'Chicago',
    team: 'Regulatory',
    description:
      'Carry the licensing file for a fleet rather than for a single plant. You will argue the case that a modernized version of a proven, operating reactor is a shorter path than a paper concept, and you will build the evidence that makes that argument stand up.'
  },
  {
    slug: 'operations-trainer',
    title: 'Operations Trainer',
    location: 'Rotterdam',
    team: 'Operations Academy',
    description:
      'Build the programme that staffs the reactors we own and run. You will write the curriculum, run the simulator sessions and certify the operators who take a module from first criticality through its commercial life.'
  }
];

const STORIES = [
  {
    slug: 'first-module-order',
    title: 'First module order signed',
    outlet: 'Company news',
    published_at: '2026-08-18',
    featured: true,
    body:
      'The first firm order for a Zettajoule module has been signed with an industrial customer in the Rotterdam cluster. The agreement covers a single module supplying process heat and power under a long term energy agreement, with Zettajoule owning, operating and staffing the plant.\n\nThe order follows two years of front end engineering and a site specific safety study. Delivery is planned in transportable sections from the module line, with commissioning support from the Operations Academy, whose first cohort certified earlier this year.\n\n"An order is the moment a technology stops being a proposal," said Mira Halvorsen, Chief Executive. "The customer is not buying a reactor. They are buying heat and power at a fixed price, on a schedule, with the operating risk sitting with us."'
  },
  {
    slug: 'helium-loop-milestone',
    title: 'Helium loop completes a 1000 hour run',
    outlet: 'Company news',
    published_at: '2026-07-02',
    featured: false,
    body:
      'The full scale helium test loop has completed a continuous 1000 hour run at outlet conditions, holding 750 degrees Celsius across the campaign without an unplanned stop.\n\nThe loop exercises the circulator, the heat exchanger and the instrumentation in the same geometry as the module, and the run gathered creep and thermal cycling data that feeds directly into the licensing file. Chemistry sampling across the campaign confirmed the coolant stayed inert against every wetted surface.\n\n"A thousand hours is the number regulators recognise," said Tobias Ruiz, Chief Technology Officer. "It is long enough that the boring failure modes have had their chance."'
  },
  {
    slug: 'steel-partnership',
    title: 'Steel partnership targets the hydrogen route',
    outlet: 'Industry Week',
    published_at: '2026-05-14',
    featured: false,
    body:
      'A European steelmaker and Zettajoule have opened a joint study into supplying a direct reduced iron plant with hydrogen produced from high temperature heat and electricity.\n\nThe hydrogen route to steel replaces coke with hydrogen in a shaft furnace, and the furnace does not tolerate interruption. The study covers an eight module block inside the works fence, sized for firm hydrogen supply and for the reduction gas preheat duty.\n\nThe attraction is efficiency. Feeding heat into the electrolysis step means less of the energy of splitting water has to arrive as electricity, which is the difference between green steel that pencils out and green steel that does not.'
  },
  {
    slug: 'licensing-step-cleared',
    title: 'Licensing step cleared',
    outlet: 'Energy Monitor',
    published_at: '2026-03-09',
    featured: false,
    body:
      'Zettajoule has cleared the first formal step of the generic design assessment, with the regulator accepting the fuel qualification package for review.\n\nThe package rests on coated particle fuel that has been manufactured and irradiated for decades, and on an operating test reactor of the same family that has run since the late 1990s. Assessors noted that the applicant was modernizing an existing design rather than proposing a novel one.\n\n"We are not asking anyone to believe a simulation," said Anneke Vos, Head of Licensing. "The reactor exists. We are making it manufacturable."'
  },
  {
    slug: 'academy-first-cohort',
    title: 'Operations Academy takes its first cohort',
    outlet: 'Company news',
    published_at: '2026-02-11',
    featured: false,
    body:
      'The Operations Academy has taken its first cohort of twenty four trainees, drawn from marine engineering, process operations and the armed forces.\n\nThe programme runs eighteen months across simulator work, radiological protection and plant chemistry, and ends in certification against the module operating envelope. Because Zettajoule owns and staffs the plants it builds, every graduate has a station waiting.\n\n"Fleets are staffed, not hired," said Daniel Okoye, Head of Operations Academy. "If you plan to run twenty modules you start the people twenty four months before the first one is hot."'
  },
  {
    slug: 'desalination-study',
    title: 'Desalination study opens in the Gulf',
    outlet: 'Water Report',
    published_at: '2026-01-20',
    featured: false,
    body:
      'A feasibility study has opened on thermal desalination driven by module heat at a Gulf coastal site, covering a two module block feeding a multi effect distillation train.\n\nMembrane desalination pays for its water in electricity. Thermal desalination pays in heat, and heat is what a module has in surplus once the high grade duty is met. The study covers water cost per cubic metre, brine management and the coastal siting case.\n\nResults are expected before the end of the year and will be published in summary.'
  },
  {
    slug: 'helium-supply-signed',
    title: 'Helium supply agreement signed',
    outlet: 'Company news',
    published_at: '2025-11-05',
    featured: false,
    body:
      'A multi year helium supply agreement has been signed covering first inventory and make up for the initial module fleet.\n\nHelium is the coolant because it is chemically inert, stays a gas at every temperature the plant reaches, and does not become strongly radioactive in the core. Securing inventory early removes one of the few genuine supply chain questions in the design.\n\nThe agreement includes recovery and recycling terms so that the fleet inventory is recirculated rather than vented.'
  }
];

const TEAM = [
  {
    slug: 'mira-halvorsen',
    name: 'Mira Halvorsen',
    role_title: 'Chief Executive',
    bio:
      'Mira has spent twenty years turning energy engineering into energy contracts, first in offshore wind development and then in industrial decarbonisation. She joined Zettajoule because selling energy rather than reactors is the only model that lets an industrial customer act this decade. She chairs the investment committee and leads the customer agreements that anchor each block.',
    profile_url: 'https://example.com/profiles/mira-halvorsen',
    sort_order: 1
  },
  {
    slug: 'tobias-ruiz',
    name: 'Tobias Ruiz',
    role_title: 'Chief Technology Officer',
    bio:
      'Tobias is a thermal hydraulics engineer who spent a decade on high temperature gas cooled systems, including two years on an operating test reactor. He owns the primary loop, the fuel specification and the digital twin programme. His rule for the design is that nothing enters the module unless it has been operated somewhere at temperature for a thousand hours.',
    profile_url: 'https://example.com/profiles/tobias-ruiz',
    sort_order: 2
  },
  {
    slug: 'anneke-vos',
    name: 'Anneke Vos',
    role_title: 'Head of Licensing',
    bio:
      'Anneke has carried design assessments through three regulators and knows that a licence is an evidence problem rather than a paperwork problem. She built the Zettajoule licensing file around an existing, operating reactor family, so that every claim can be pointed at something that has already run. She leads engagement in the Netherlands, the United States and Japan.',
    profile_url: 'https://example.com/profiles/anneke-vos',
    sort_order: 3
  },
  {
    slug: 'daniel-okoye',
    name: 'Daniel Okoye',
    role_title: 'Head of Operations Academy',
    bio:
      'Daniel ran shift operations on a large process site before building training programmes for complex plant. Because Zettajoule staffs the reactors it owns, he treats operator supply as a manufacturing input with a two year lead time. He designed the Academy curriculum and certifies every operator against the module operating envelope.',
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
      'A high-temperature gas-cooled reactor. Helium carries the heat, graphite surrounds the fuel, and the coolant leaves the core at 750 degrees Celsius. Each module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion.',
    category: 'Technology'
  },
  {
    question: 'Why does the outlet temperature matter?',
    answer:
      'Ordinary water cooled reactors top out around 300 degrees Celsius, which is enough for electricity and little else. At 750 degrees the same module can drive chemical processes, high temperature electrolysis and industrial steam networks that a water cooled plant simply cannot serve.',
    category: 'Technology'
  },
  {
    question: 'How is the fuel made safe at those temperatures?',
    answer:
      'The fuel is tiny uranium grains, each wrapped in tough ceramic shells that hold the fission products inside. The shells stay intact well above any temperature the reactor can reach, even with all cooling removed, so the fuel itself is the containment rather than a system that has to work.',
    category: 'Technology'
  },
  {
    question: 'Do we have to buy and license a reactor?',
    answer:
      'No. Zettajoule owns the plant, runs it and staffs it. You sign an energy agreement and buy heat, hydrogen or electricity at an agreed price. The licence, the operators and the operating risk sit with us.',
    category: 'Deployment'
  },
  {
    question: 'How long does deployment take?',
    answer:
      'Modules are built in series in a factory and delivered in transportable sections, so site work is preparation and connection rather than construction. A single module site is faster than a grid connection queue, which is why data centre and mining customers start here.',
    category: 'Deployment'
  },
  {
    question: 'Can we start small and scale up?',
    answer:
      'Yes. That is the point of modules. A single module suits a mine, a town network or a compute campus; three to eight modules suit a chemical complex, a hydrogen corridor or a steel works. Modules are added as demand grows and staggered so heat never stops during maintenance.',
    category: 'Deployment'
  }
];

async function upsertSolutions(c) {
  for (const s of SOLUTIONS) {
    await c.query(
      `insert into solutions (slug, industry, title, summary, detail, output_kind, temperature_band, deployment, module_count)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (slug) do update set industry=excluded.industry, title=excluded.title,
         summary=excluded.summary, detail=excluded.detail, output_kind=excluded.output_kind,
         temperature_band=excluded.temperature_band, deployment=excluded.deployment,
         module_count=excluded.module_count`,
      [s.slug, s.industry, s.title, s.summary, s.detail, s.output_kind, s.temperature_band, s.deployment, s.module_count]
    );
  }
}

export async function seed() {
  const client = await pool.connect();
  try {
    await client.query('select pg_advisory_lock(918273646)');
    await client.query('BEGIN');

    const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    const accounts = [
      { email: 'visitor@example.com', display_name: 'Ada Moreau' },
      { email: 'visitor2@example.com', display_name: 'Ken Adeyemi' }
    ];
    for (const a of accounts) {
      await client.query(
        `insert into accounts (email, password_hash, display_name) values ($1,$2,$3)
         on conflict (email) do update set display_name = excluded.display_name,
           password_hash = case when accounts.password_hash is null or accounts.password_hash = ''
             then excluded.password_hash else accounts.password_hash end`,
        [a.email, hash, a.display_name]
      );
    }

    await upsertSolutions(client);

    for (const d of DOCUMENTS) {
      await client.query(
        `insert into documents (slug, title, category, published_at) values ($1,$2,$3,$4)
         on conflict (slug) do update set title=excluded.title, category=excluded.category, published_at=excluded.published_at`,
        [d.slug, d.title, d.category, d.published_at]
      );
    }

    for (const j of JOBS) {
      await client.query(
        `insert into jobs (slug, title, location, team, description) values ($1,$2,$3,$4,$5)
         on conflict (slug) do update set title=excluded.title, location=excluded.location,
           team=excluded.team, description=excluded.description`,
        [j.slug, j.title, j.location, j.team, j.description]
      );
    }

    for (const s of STORIES) {
      await client.query(
        `insert into stories (slug, title, outlet, published_at, featured, body) values ($1,$2,$3,$4,$5,$6)
         on conflict (slug) do update set title=excluded.title, outlet=excluded.outlet,
           published_at=excluded.published_at, featured=excluded.featured, body=excluded.body`,
        [s.slug, s.title, s.outlet, s.published_at, s.featured, s.body]
      );
    }
    await client.query(`update stories set featured = false where slug <> 'first-module-order'`);

    for (const t of TEAM) {
      await client.query(
        `insert into team_members (slug, name, role_title, bio, profile_url, sort_order) values ($1,$2,$3,$4,$5,$6)
         on conflict (slug) do update set name=excluded.name, role_title=excluded.role_title,
           bio=excluded.bio, profile_url=excluded.profile_url, sort_order=excluded.sort_order`,
        [t.slug, t.name, t.role_title, t.bio, t.profile_url, t.sort_order]
      );
    }

    for (const o of OFFICES) {
      await client.query(
        `insert into offices (city, country, role_label) values ($1,$2,$3)
         on conflict (city) do update set country=excluded.country, role_label=excluded.role_label`,
        [o.city, o.country, o.role_label]
      );
    }

    for (const f of FAQS) {
      await client.query(
        `insert into faqs (question, answer, category) values ($1,$2,$3)
         on conflict (question) do update set answer=excluded.answer, category=excluded.category`,
        [f.question, f.answer, f.category]
      );
    }

    // account-scoped seed rows
    const ada = (await client.query(`select id from accounts where email='visitor@example.com'`)).rows[0];
    const ken = (await client.query(`select id from accounts where email='visitor2@example.com'`)).rows[0];
    const solIds = {};
    for (const r of (await client.query('select id, slug from solutions')).rows) solIds[r.slug] = r.id;

    const saves = [
      [ada.id, 'steel'],
      [ada.id, 'data-centres'],
      [ken.id, 'mining']
    ];
    for (const [accId, slug] of saves) {
      await client.query(
        `insert into saved_solutions (account_id, solution_id) values ($1,$2) on conflict do nothing`,
        [accId, solIds[slug]]
      );
    }

    await client.query(
      `insert into saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
       values ($1,'Hydrogen sites',null,null,'hydrogen',null,null)
       on conflict (account_id, name) do update set output_kind = excluded.output_kind`,
      [ada.id]
    );

    await client.query(
      `insert into enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
       values ('ENQ-7K2M9QD4',$1,'Ada Moreau','visitor@example.com','+31','612345678','Investor relations',
         'We are reviewing the module fleet plan and would like to discuss the roadmap to first deployment.','answered')
       on conflict (reference) do nothing`,
      [ada.id]
    );
    await client.query(
      `insert into enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
       values ('ENQ-5R8X1CJ2',$1,'Ken Adeyemi','visitor2@example.com','+1','3125550188','Careers',
         'I would like to know more about the Operations Academy intake for next year.','received')
       on conflict (reference) do nothing`,
      [ken.id]
    );

    await client.query(
      `insert into access_requests (reference, account_id, organisation, role_title, status)
       values ('IAR-4H7N2PQ8',$1,'Moreau Capital','Managing Partner','approved')
       on conflict (account_id) do update set status = excluded.status`,
      [ada.id]
    );
    await client.query(
      `insert into access_requests (reference, account_id, organisation, role_title, status)
       values ('IAR-9T3V6BLM',$1,'Adeyemi Industrial','Head of Strategy','pending')
       on conflict (account_id) do nothing`,
      [ken.id]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.query('select pg_advisory_unlock(918273646)').catch(() => {});
    client.release();
  }
}
