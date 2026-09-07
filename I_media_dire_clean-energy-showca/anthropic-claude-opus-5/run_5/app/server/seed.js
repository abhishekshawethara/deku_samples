import { pool } from './db.js';
import { hashPassword } from './auth.js';

export const SEED_PASSWORD = 'deku-demo-pw-2026';

const solutions = [
	{
		slug: 'oil-and-gas',
		industry: 'Oil and Gas',
		title: 'Oil and Gas',
		summary:
			'Replace fired heaters and steam boilers on refining and upgrading sites with carbon free process heat at temperature.',
		detail:
			'Refineries and upgraders burn gas all day to make process heat. A multi-module Zettajoule plant delivers that heat directly through a helium to steam loop, holding the 250 to 550 C band the crackers, reformers and distillation trains ask for, without a flare, a stack or a fuel price. Four modules sit inside the existing utility block and hand over steam at the header the site already owns, so the process side is unchanged. We own the reactor, we run it, we staff it, and the site buys energy by the gigajoule on a long contract. Block by block: helium leaves the core at 750 C, gives its heat to the steam generator, the steam joins the site header, and the cooled helium returns to the core. Carbon falls on day one and it keeps falling for sixty years.',
		output_kind: 'heat',
		temperature_band: '250 to 550 C',
		deployment: 'multi-module',
		module_count: 4
	},
	{
		slug: 'chemicals',
		industry: 'Chemicals',
		title: 'Chemicals',
		summary:
			'High grade heat and on site power together, for crackers, reformers and the compressors that serve them.',
		detail:
			'A chemical complex needs two things at once: very hot process heat and a great deal of reliable electricity. A three module Zettajoule plant gives both from one helium loop, splitting the 750 C outlet between a process heat exchanger and a turbine set. The 550 to 750 C band reaches steam cracking and reforming duties that a water cooled reactor cannot touch. Because the modules are identical and factory built, capacity follows the complex as it grows. Block by block: core, hot helium header, process exchanger for the reaction heat, turbine and generator for the site load, then the return leg. The site keeps its own switchgear and its own control room; what changes is where the energy comes from.',
		output_kind: 'heat-and-power',
		temperature_band: '550 to 750 C',
		deployment: 'multi-module',
		module_count: 3
	},
	{
		slug: 'transport',
		industry: 'Transport',
		title: 'Transport',
		summary:
			'Clean hydrogen at scale for heavy road, rail, shipping and aviation fuel, made with heat rather than only with electricity.',
		detail:
			'Hydrogen made by electrolysis alone is expensive because electricity is expensive. Feeding a high temperature electrolyser with 750 C steam moves part of the work from electricity to heat and lifts the efficiency of the whole chain. Six modules make a hydrogen plant that runs at a steady rate every hour of the year, which is what a fuel supply chain actually needs. The 550 to 750 C band is the point of the machine. Block by block: core, hot helium header, steam raiser, solid oxide electrolyser stack, then drying and compression to the pipeline or the filling point. The result is a fuel for trucks, trains, ships and synthetic aviation kerosene that carries no carbon at the point of use and none at the point of production either.',
		output_kind: 'hydrogen',
		temperature_band: '550 to 750 C',
		deployment: 'multi-module',
		module_count: 6
	},
	{
		slug: 'steel',
		industry: 'Steel',
		title: 'Steel',
		summary:
			'The hydrogen route to primary steel, at the volume a full scale direct reduction plant consumes.',
		detail:
			'Primary steel made with coke carries about two tonnes of carbon dioxide for every tonne of steel. Direct reduction with hydrogen removes that carbon entirely, but only if the hydrogen arrives in enormous quantity at a believable price. Eight Zettajoule modules feed a high temperature electrolysis plant sized to a working direct reduction shaft, running flat out all year. The 550 to 750 C band is what makes the electrolysis efficient enough to matter. Block by block: core, helium header, steam raiser, electrolyser hall, buffer storage, then the reduction shaft itself. The mill keeps its own metallurgy; we change the reductant and we own the plant that makes it.',
		output_kind: 'hydrogen',
		temperature_band: '550 to 750 C',
		deployment: 'multi-module',
		module_count: 8
	},
	{
		slug: 'mining',
		industry: 'Mining',
		title: 'Mining',
		summary:
			'Firm off grid electricity for remote pits, mills and haulage fleets, replacing diesel gensets entirely.',
		detail:
			'A remote mine runs on diesel trucked in over hundreds of kilometres, and its power costs move with the fuel price and the road. A single Zettajoule module is a self contained power station of 100 MW electrical that runs for years between refuellings, sitting inside the mine perimeter with no fuel convoy behind it. The up to 250 C band covers the site heat that comes with it. Block by block: core, helium loop, turbine and generator, then the mine switchyard, with waste heat going to the process plant and the camp. Electrified haulage becomes possible because the electricity is finally there. We own it, we run it, and the mine buys megawatt hours.',
		output_kind: 'electricity',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'data-centres',
		industry: 'Data Centres',
		title: 'Data Centres',
		summary:
			'Firm round the clock power beside the hall, with the waste heat sold on rather than thrown away.',
		detail:
			'A data centre campus needs power that does not vary with the weather and does not wait years for a grid connection. Two Zettajoule modules give 200 MW electrical behind the meter, on the campus, available every hour. The up to 250 C band matches the low grade heat a district network or a greenhouse can take, so the rejected heat becomes a second product instead of a plume. Block by block: core, helium loop, turbine and generator, campus switchgear, then a heat offtake on the condenser side. Grid capacity stops being the constraint on where compute can be built, and the campus carries a carbon figure it can publish.',
		output_kind: 'electricity',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 2
	},
	{
		slug: 'communities',
		industry: 'Communities',
		title: 'Communities',
		summary:
			'District heating and local electricity for a town, from one module on the edge of it.',
		detail:
			'A town heated by gas boilers in every building has no simple way to decarbonise. One Zettajoule module supplies a district heat network and the local distribution grid together, in the up to 250 C band a network of pipes and radiators actually uses. It is quiet, it has no stack, and its footprint is a few hectares. Block by block: core, helium loop, a heat exchanger onto the district water, a turbine set for the local electrical load, then the return leg. The municipality signs for heat and power at a fixed price for decades; we own, operate and staff the plant, and the Operations Academy trains the crew locally.',
		output_kind: 'heat-and-power',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'desalination',
		industry: 'Desalination',
		title: 'Desalination',
		summary:
			'Thermal desalination at municipal scale, turning seawater into drinking water with heat rather than fuel.',
		detail:
			'Thermal desalination is the most robust way to make fresh water from difficult seawater, and it is normally driven by burning gas. Two Zettajoule modules drive a multi effect distillation train in the 250 to 550 C band, delivering water at a steady rate all year with no fuel deliveries and no emissions. Block by block: core, helium loop, steam generator, the distillation effects in series, then the brine handling and the potable water header. The plant sits on the coast beside the intake it already uses. For a water authority the appeal is simple: the cost of water stops tracking the cost of fuel, and the carbon disappears from the balance.',
		output_kind: 'heat',
		temperature_band: '250 to 550 C',
		deployment: 'single-module',
		module_count: 2
	}
];

const documents = [
	{ slug: 'investor-deck-2026', title: 'Investor Deck 2026', category: 'Financials', published_at: '2026-08-01' },
	{ slug: 'technology-dossier', title: 'Technology Dossier', category: 'Technology', published_at: '2026-06-15' },
	{ slug: 'licensing-roadmap', title: 'Licensing Roadmap', category: 'Regulatory', published_at: '2026-04-30' }
];

const jobs = [
	{
		slug: 'reactor-systems-engineer',
		title: 'Reactor Systems Engineer',
		location: 'Rotterdam',
		team: 'Engineering',
		description:
			'Own the helium primary loop from the core outlet to the steam generator: layout, transients, and the instrumentation that proves the case. You will work against the digital twin daily and take your designs through licensing review with the regulatory team. We are looking for someone who has carried a thermal hydraulic design through to a built article.'
	},
	{
		slug: 'licensing-lead',
		title: 'Licensing Lead',
		location: 'Chicago',
		team: 'Regulatory',
		description:
			'Carry the modernized design through a national regulator, building the safety case on the operating record of the test reactor that has run since the late 1990s. You will be the person who turns engineering evidence into a submission a regulator can act on, and who tells the engineering team what evidence is still missing.'
	},
	{
		slug: 'operations-trainer',
		title: 'Operations Trainer',
		location: 'Rotterdam',
		team: 'Operations Academy',
		description:
			'Build and teach the programme that staffs every plant we own. Because we operate the reactors we sell energy from, the Academy is the company: you will write the simulator scenarios, run the classroom, and sign off the crews who take the night shift.'
	}
];

const stories = [
	{
		slug: 'first-module-order',
		title: 'First module order signed',
		outlet: 'Company news',
		published_at: '2026-08-18',
		featured: true,
		body:
			'Zettajoule has signed its first firm order for reactor modules, with delivery into an industrial site in northwest Europe. The order covers the complete plant, and under our model we retain ownership of it: the customer buys energy, not equipment, on a long term contract at a fixed price per gigajoule. The signature follows two years of joint engineering and a licensing pre application that ran alongside it. Manufacture of the first pressure vessel begins next quarter, and the Operations Academy has opened recruitment for the crew that will run the plant when it starts.'
	},
	{
		slug: 'helium-loop-milestone',
		title: 'Helium loop completes a 1000 hour run',
		outlet: 'Company news',
		published_at: '2026-07-02',
		featured: false,
		body:
			'The full scale helium test loop has completed a continuous 1000 hour run at the design outlet temperature of 750 degrees Celsius, holding steady flow and chemistry throughout. The run covered the transient cases the safety case needs, including a loss of forced circulation, in which the core cooled by conduction and radiation alone as intended. Data from the run has been folded into the digital twin, which now predicts loop behaviour to within the instrument error over the whole envelope.'
	},
	{
		slug: 'steel-partnership',
		title: 'Steel partnership targets the hydrogen route',
		outlet: 'Industry Week',
		published_at: '2026-05-14',
		featured: false,
		body:
			'A partnership announced this week pairs Zettajoule modules with a direct reduction plant, aiming at primary steel made with hydrogen rather than coke. The arrangement is notable for its scale: eight modules feeding high temperature electrolysis, running flat out all year, which is the volume a full size reduction shaft actually consumes. High temperature steam moves part of the electrolysis work from electricity to heat, which is what makes the fuel cost credible against the incumbent route.'
	},
	{
		slug: 'licensing-step-cleared',
		title: 'Licensing step cleared',
		outlet: 'Energy Monitor',
		published_at: '2026-03-09',
		featured: false,
		body:
			'Regulators have accepted the first tranche of the design submission, clearing a step that many advanced reactor developers have found slow. Zettajoule argues its route is shorter because the design is a modernized version of a reactor that has been running since the late 1990s, so the safety case rests on an operating record rather than on a paper concept. The next tranche covers the fuel qualification and the module manufacturing arrangements.'
	},
	{
		slug: 'academy-first-cohort',
		title: 'Operations Academy takes its first cohort',
		outlet: 'Company news',
		published_at: '2026-02-11',
		featured: false,
		body:
			'The Operations Academy has welcomed its first cohort of trainee operators in Rotterdam. Because Zettajoule owns and runs the plants it builds, staffing is not a customer problem to solve later but the core of the business, and the Academy is how it is solved. The programme runs classroom work alongside simulator time on the digital twin, and the cohort will follow the first plant from manufacture through commissioning to its first year of operation.'
	},
	{
		slug: 'desalination-study',
		title: 'Desalination study opens in the Gulf',
		outlet: 'Water Report',
		published_at: '2026-01-20',
		featured: false,
		body:
			'A feasibility study has begun on a thermal desalination plant driven by two reactor modules, serving a coastal municipality in the Gulf. Thermal desalination handles difficult seawater better than membranes but is normally driven by burning gas. The study examines whether nuclear process heat can decouple the cost of water from the price of fuel over a plant life of decades, and reports late this year.'
	},
	{
		slug: 'helium-supply-signed',
		title: 'Helium supply agreement signed',
		outlet: 'Company news',
		published_at: '2025-11-05',
		featured: false,
		body:
			'Zettajoule has secured a long term helium supply agreement covering the first fleet of modules. Helium is the coolant because it is chemically inert: it does not react with the graphite, the fuel or the steel it touches, and it carries no activation burden that complicates maintenance. Securing supply early removes one of the small but real commercial risks in the programme.'
	}
];

const team = [
	{
		slug: 'mira-halvorsen',
		name: 'Mira Halvorsen',
		role_title: 'Chief Executive',
		bio:
			'Mira has spent twenty five years building and financing energy infrastructure across Europe and North America, most recently taking a fleet of industrial cogeneration plants from first contract to operation. She founded Zettajoule on the conviction that industry does not want to buy reactors, it wants to buy energy, and that whoever is willing to own and operate the machine will be the one that gets built. She chairs the investment committee and leads the customer relationships.',
		profile_url: 'https://www.zettajoule.example/team/mira-halvorsen',
		sort_order: 1
	},
	{
		slug: 'tobias-ruiz',
		name: 'Tobias Ruiz',
		role_title: 'Chief Technology Officer',
		bio:
			'Tobias led high temperature gas cooled reactor thermal hydraulics for over a decade before joining Zettajoule, including three years on the test reactor programme whose operating record underpins the modernized design. He owns the reactor architecture, the helium loop and the digital twin, and he is unusually insistent that every claim in the safety case be traceable to a measurement someone actually took.',
		profile_url: 'https://www.zettajoule.example/team/tobias-ruiz',
		sort_order: 2
	},
	{
		slug: 'anneke-vos',
		name: 'Anneke Vos',
		role_title: 'Head of Licensing',
		bio:
			'Anneke has taken two reactor designs through national regulators and has sat on the regulator side of the table as well, which is why she plans submissions backwards from the evidence a reviewer will ask for. At Zettajoule she runs the licensing roadmap and the pre application engagement in every market the company intends to enter.',
		profile_url: 'https://www.zettajoule.example/team/anneke-vos',
		sort_order: 3
	},
	{
		slug: 'daniel-okoye',
		name: 'Daniel Okoye',
		role_title: 'Head of Operations Academy',
		bio:
			'Daniel built and ran operator training programmes for a fleet of conventional plants before joining Zettajoule to found the Operations Academy. Because the company staffs the reactors it owns, his programme is the mechanism by which the business scales, and he treats a shift crew as the product every bit as much as the module they operate.',
		profile_url: 'https://www.zettajoule.example/team/daniel-okoye',
		sort_order: 4
	}
];

const offices = [
	{ city: 'Rotterdam', country: 'Netherlands', role_label: 'Headquarters' },
	{ city: 'Chicago', country: 'United States', role_label: 'Licensing' },
	{ city: 'Tokyo', country: 'Japan', role_label: 'Engineering' }
];

const faqs = [
	{
		question: 'What kind of reactor is this?',
		answer:
			'A high-temperature gas-cooled reactor. Each module delivers 250 MW thermal and its helium coolant leaves the core at 750 degrees Celsius at the outlet, which is far hotter than a water cooled reactor and is what lets it serve industrial process heat directly.',
		category: 'Technology'
	},
	{
		question: 'Why helium as a coolant?',
		answer:
			'Helium is chemically inert. It does not react with the graphite, the fuel or the steel it flows past, it stays a gas at any temperature the plant reaches, and it does not become a chemical hazard in an accident. That inertness is what allows the very high outlet temperature.',
		category: 'Technology'
	},
	{
		question: 'What is the fuel and why is it safe at high temperature?',
		answer:
			'Tiny uranium grains are wrapped in tough ceramic shells that hold the fission products inside them at temperatures well beyond anything the reactor reaches in normal operation or in an accident. The graphite around the fuel gives the core an enormous heat capacity, so it warms slowly and cools by conduction alone if the coolant flow stops.',
		category: 'Technology'
	},
	{
		question: 'How long does deployment take?',
		answer:
			'The modules are factory built and shipped, so site work is civil preparation and connection rather than reactor construction. A single-module plant is quicker to stand up than a multi-module one, and capacity is added later by adding modules rather than by redesigning the plant.',
		category: 'Deployment'
	},
	{
		question: 'Do we have to operate the reactor ourselves?',
		answer:
			'No. Zettajoule owns the plant, runs it and staffs it through the Operations Academy. You buy the energy, heat, power or hydrogen, on a long term contract at an agreed price. Nuclear operation never becomes your organisation problem.',
		category: 'Deployment'
	},
	{
		question: 'How many modules will our site need?',
		answer:
			'One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs 8000 hours a year. Enter your need in the calculator and it returns the module count rounded up to a whole module, the annual clean energy that delivers and the carbon it avoids.',
		category: 'Deployment'
	}
];

async function seedContent(client) {
	for (const s of solutions) {
		await client.query(
			`INSERT INTO solutions (slug, industry, title, summary, detail, output_kind, temperature_band, deployment, module_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (slug) DO UPDATE SET industry=EXCLUDED.industry, title=EXCLUDED.title, summary=EXCLUDED.summary,
         detail=EXCLUDED.detail, output_kind=EXCLUDED.output_kind, temperature_band=EXCLUDED.temperature_band,
         deployment=EXCLUDED.deployment, module_count=EXCLUDED.module_count`,
			[s.slug, s.industry, s.title, s.summary, s.detail, s.output_kind, s.temperature_band, s.deployment, s.module_count]
		);
	}
	for (const d of documents) {
		await client.query(
			`INSERT INTO documents (slug, title, category, published_at) VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category, published_at=EXCLUDED.published_at`,
			[d.slug, d.title, d.category, d.published_at]
		);
	}
	for (const j of jobs) {
		await client.query(
			`INSERT INTO jobs (slug, title, location, team, description) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, location=EXCLUDED.location, team=EXCLUDED.team, description=EXCLUDED.description`,
			[j.slug, j.title, j.location, j.team, j.description]
		);
	}
	for (const s of stories) {
		await client.query(
			`INSERT INTO stories (slug, title, outlet, published_at, featured, body) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, outlet=EXCLUDED.outlet, published_at=EXCLUDED.published_at,
         featured=EXCLUDED.featured, body=EXCLUDED.body`,
			[s.slug, s.title, s.outlet, s.published_at, s.featured, s.body]
		);
	}
	for (const t of team) {
		await client.query(
			`INSERT INTO team_members (slug, name, role_title, bio, profile_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, role_title=EXCLUDED.role_title, bio=EXCLUDED.bio,
         profile_url=EXCLUDED.profile_url, sort_order=EXCLUDED.sort_order`,
			[t.slug, t.name, t.role_title, t.bio, t.profile_url, t.sort_order]
		);
	}
	for (const o of offices) {
		await client.query(
			`INSERT INTO offices (city, country, role_label) VALUES ($1,$2,$3)
       ON CONFLICT (city) DO UPDATE SET country=EXCLUDED.country, role_label=EXCLUDED.role_label`,
			[o.city, o.country, o.role_label]
		);
	}
	for (const f of faqs) {
		await client.query(
			`INSERT INTO faqs (question, answer, category) VALUES ($1,$2,$3)
       ON CONFLICT (question) DO UPDATE SET answer=EXCLUDED.answer, category=EXCLUDED.category`,
			[f.question, f.answer, f.category]
		);
	}
}

async function accountId(client, email) {
	const { rows } = await client.query('SELECT id FROM accounts WHERE email = $1', [email]);
	return rows[0]?.id;
}

async function solutionId(client, slug) {
	const { rows } = await client.query('SELECT id FROM solutions WHERE slug = $1', [slug]);
	return rows[0]?.id;
}

async function seedAccounts(client) {
	const people = [
		{ email: 'visitor@example.com', display_name: 'Ada Moreau' },
		{ email: 'visitor2@example.com', display_name: 'Ken Adeyemi' }
	];
	for (const p of people) {
		await client.query(
			`INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name`,
			[p.email, hashPassword(SEED_PASSWORD), p.display_name]
		);
	}

	const ada = await accountId(client, 'visitor@example.com');
	const ken = await accountId(client, 'visitor2@example.com');

	for (const [acc, slug] of [
		[ada, 'steel'],
		[ada, 'data-centres'],
		[ken, 'mining']
	]) {
		const sid = await solutionId(client, slug);
		await client.query(
			`INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
       ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING`,
			[acc, sid]
		);
	}

	await client.query(
		`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (account_id, name) DO NOTHING`,
		[ada, 'Hydrogen sites', '', '', 'hydrogen', '', '']
	);

	await client.query(
		`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (reference) DO NOTHING`,
		[
			'ENQ-7K2M9QD4',
			ada,
			'Ada Moreau',
			'visitor@example.com',
			'+31',
			'610000001',
			'Investor relations',
			'We are preparing a Series B review and would like access to the document room and a call with the licensing lead.',
			'answered'
		]
	);
	await client.query(
		`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (reference) DO NOTHING`,
		[
			'ENQ-5R8X1CJ2',
			ken,
			'Ken Adeyemi',
			'visitor2@example.com',
			'+1',
			'3120000002',
			'Careers',
			'I am interested in the Operations Academy and would like to know when the next cohort opens.',
			'received'
		]
	);

	await client.query(
		`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
     VALUES ($1,$2,$3,$4,$5) ON CONFLICT (account_id) DO NOTHING`,
		['IAR-4H7N2PQ8', ada, 'Meridian Capital', 'Partner', 'approved']
	);
	await client.query(
		`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
     VALUES ($1,$2,$3,$4,$5) ON CONFLICT (account_id) DO NOTHING`,
		['IAR-9T3V6BLM', ken, 'Northwind Industrial', 'Head of Strategy', 'pending']
	);
}

export async function seed(log) {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		await client.query('SELECT pg_advisory_xact_lock(918273645)');
		await seedContent(client);
		await seedAccounts(client);
		await client.query('COMMIT');
		log?.info({ event: 'seed_complete' });
	} catch (err) {
		await client.query('ROLLBACK').catch(() => {});
		throw err;
	} finally {
		client.release();
	}
}
