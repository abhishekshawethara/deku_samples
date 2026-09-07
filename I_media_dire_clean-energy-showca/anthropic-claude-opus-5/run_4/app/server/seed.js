import { SCHEMA_SQL } from './schema.js';
import { hashPassword } from './auth.js';

export const SEED_PASSWORD = 'deku-demo-pw-2026';

const SOLUTIONS = [
	{
		slug: 'oil-and-gas',
		industry: 'Oil and Gas',
		title: 'Process heat for refining and upgrading',
		summary:
			'Steady high-grade process heat replaces fired heaters across refining, upgrading and heavy oil recovery, with no combustion on site.',
		detail:
			'Refineries burn gas to make heat, and that heat is the single largest source of emissions on the site. A Zettajoule module delivers 250 MW thermal as clean heat at the temperature the process already expects, so distillation columns, reformers and steam generators keep running against the same curves. Four modules cover a mid-size refinery with margin for turnaround, and the plant buys energy rather than owning a reactor. We own it, we run it and we staff it, and the refinery sees a heat supply contract with a fixed price and no fuel exposure.',
		output_kind: 'heat',
		temperature_band: '250 to 550 C',
		deployment: 'multi-module',
		module_count: 4
	},
	{
		slug: 'chemicals',
		industry: 'Chemicals',
		title: 'Heat and power for continuous chemical plant',
		summary:
			'Crackers, ammonia loops and chlor-alkali cells take heat and electricity from the same modules on one contract.',
		detail:
			'A chemical complex needs both grades of energy at once: high-temperature heat for the reaction section and steady electricity for compression and separation. Three modules deliver both from one site, taking helium at 750 degrees Celsius through the process heat exchanger and passing the remainder to a turbine. Because the plant runs continuously, the modules run continuously, and the load factor is the best of any application we serve. Steam is raised where the process wants steam, and the electrical side firms the site against grid interruption.',
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
			'High-temperature electrolysis at the outlet temperature of the reactor makes hydrogen for freight, shipping and aviation fuel.',
		detail:
			'Hydrogen made by ordinary electrolysis pays for every degree of heat with electricity. Feed the cell with steam at 750 degrees Celsius instead and the electrical demand falls sharply, because the reactor has already done the thermal part of the work. Six modules sited on a freight corridor or at a port produce hydrogen at a delivered cost that competes with the steam methane route, without its carbon. The same hydrogen feeds synthetic aviation fuel where the offtake wants a liquid.',
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
			'The hydrogen route to steel needs enormous volumes of clean hydrogen at a steady price; eight modules supply a full-scale plant.',
		detail:
			'Direct reduction replaces the blast furnace carbon with hydrogen, and the whole case rests on hydrogen that is both clean and cheap enough to make steel with. Eight modules beside the plant produce hydrogen continuously through high-temperature electrolysis, with the reactor supplying the heat that would otherwise be bought as electricity. The shaft furnace sees a supply that does not move with the gas market, and the mill sees a price it can put into a long contract. This is the largest single application we serve and the one that changes an industry outright.',
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
			'One module replaces the diesel gensets that power a remote pit, mill and camp, at a fixed price with no fuel convoy.',
		detail:
			'A remote mine runs on diesel flown or trucked in, and the fuel line is both the largest operating cost and the largest risk. A single module delivers 100 MW electrical without a fuel convoy and refuels on a cycle measured in years rather than days. The mill takes firm power, the camp takes the rest, and the site sheds its diesel storage and its generator maintenance. When the ore body is worked out the module is removed and redeployed, which is the advantage of an energy contract over a power station.',
		output_kind: 'electricity',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'data-centres',
		industry: 'Data Centres',
		title: 'Firm clean power for compute campuses',
		summary:
			'Two modules give a compute campus round-the-clock carbon-free electricity behind the meter, with waste heat available for the estate.',
		detail:
			'A compute campus wants power that is clean every hour, not clean on an annual average, and it wants it without waiting for a grid connection. Two modules sited behind the meter deliver 200 MW electrical continuously, matched hour by hour, with the low-grade waste heat available for district heating or for the campus itself. The operator signs a long energy contract and we carry the reactor, the licence, the fuel and the crew. Growth is met by adding a module rather than rebuilding the site.',
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
			'A single module heats a town and powers it, replacing a coal or gas plant on the same footprint and often the same connection.',
		detail:
			'District heating networks were built around a coal or gas plant, and the network outlives the plant that fed it. A single module drops into that role: hot water into the existing network at the temperature it was designed for, and electricity into the existing connection. The town keeps its pipes and its grid point and loses its stack. Because the module is small, the community can see the whole thing, and because we own and operate it, the municipality is buying heat rather than becoming a nuclear operator.',
		output_kind: 'heat-and-power',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'desalination',
		industry: 'Desalination',
		title: 'Thermal desalination at scale',
		summary:
			'Two modules drive multi-effect distillation for a coastal city, turning seawater into fresh water on heat rather than fuel.',
		detail:
			'Thermal desalination is a heat problem before it is a water problem, and the heat is usually bought as burned gas. Two modules supply multi-effect distillation directly at the grade the effects want, producing fresh water at a volume that serves a coastal city and an agricultural hinterland. The plant runs on a steady thermal supply rather than a fuel price, and the same site can take the electrical remainder for pumping and treatment. Where water and power scarcity arrive together, one contract answers both.',
		output_kind: 'heat',
		temperature_band: '250 to 550 C',
		deployment: 'single-module',
		module_count: 2
	}
];

const DOCUMENTS = [
	{ slug: 'investor-deck-2026', title: 'Investor Deck 2026', category: 'Financials', published_at: '2026-08-01' },
	{ slug: 'technology-dossier', title: 'Technology Dossier', category: 'Technology', published_at: '2026-06-15' },
	{ slug: 'licensing-roadmap', title: 'Licensing Roadmap', category: 'Regulatory', published_at: '2026-04-20' }
];

const JOBS = [
	{
		slug: 'reactor-systems-engineer',
		title: 'Reactor Systems Engineer',
		location: 'Rotterdam',
		team: 'Engineering',
		description:
			'Own the primary helium circuit from the core outlet to the process heat exchanger. You will size components, run the thermal hydraulic cases that support the safety analysis, and work with the digital twin team so that the model and the metal say the same thing. We expect strong thermal hydraulics and a habit of writing the assumption down next to the number.'
	},
	{
		slug: 'licensing-lead',
		title: 'Licensing Lead',
		location: 'Chicago',
		team: 'Regulatory',
		description:
			'Carry the licensing case for a modernized high-temperature gas-cooled design whose ancestor has been running since the late 1990s. You will assemble the evidence, meet the regulator, and turn a proven operating record into an application that survives review. Experience of a first-of-a-kind submission matters more than the number of years behind it.'
	},
	{
		slug: 'operations-trainer',
		title: 'Operations Trainer',
		location: 'Rotterdam',
		team: 'Operations Academy',
		description:
			'We own and run the reactors we sell energy from, which means we hire and train every crew. You will build the simulator curriculum, take a cohort through it, and set the standard that a Zettajoule control room holds. A background in operating a plant and a genuine liking for teaching are both required.'
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
			'Zettajoule has signed its first firm module order, converting two years of engineering and licensing work into a delivery date. The order covers a multi-module installation serving industrial process heat, structured as an energy supply agreement rather than a plant sale: Zettajoule owns the modules, operates them and staffs them, and the customer buys heat by the gigajoule. The commercial shape matters as much as the engineering. It removes the licensing burden from the customer, keeps the operating crew inside the company that designed the machine, and puts the capital risk where the expertise sits. Long lead components are already in fabrication and the first crew enters the Operations Academy this quarter.'
	},
	{
		slug: 'helium-loop-milestone',
		title: 'Helium loop completes a 1000 hour run',
		outlet: 'Company news',
		published_at: '2026-07-02',
		featured: false,
		body:
			'The full-scale helium test loop has completed a continuous 1000 hour run at outlet conditions, holding 750 degrees Celsius across the process heat exchanger without an unplanned stop. The run is the qualification the component programme was built around: bearings, seals, the circulator and the heat exchanger have now all seen the duty they will see in service, for long enough to show wear rather than merely survive. Helium is chemically inert and does not attack what it touches, which is the reason the coolant was chosen, and the post-run inspection found the surfaces where the model said they would be. The loop returns to service next month for transient testing.'
	},
	{
		slug: 'steel-partnership',
		title: 'Steel partnership targets the hydrogen route',
		outlet: 'Industry Week',
		published_at: '2026-05-14',
		featured: false,
		body:
			'A partnership announced this week pairs Zettajoule modules with a direct reduced iron plant, aiming to supply the hydrogen the shaft furnace needs at a price that a steel contract can carry. High-temperature electrolysis fed with steam from the reactor cuts the electrical demand of hydrogen production sharply, because the thermal part of the work has already been done upstream. Eight modules would serve a full-scale plant. The parties describe the work as a feasibility and siting phase, with a decision point next year, and are explicit that the case rests on delivered hydrogen cost rather than on any subsidy.'
	},
	{
		slug: 'licensing-step-cleared',
		title: 'Licensing step cleared',
		outlet: 'Energy Monitor',
		published_at: '2026-03-09',
		featured: false,
		body:
			'Regulators have accepted the design description and safety approach for the Zettajoule module, closing the first formal step of the licensing route. The company has leaned throughout on the operating record of the test reactor its design modernizes, which has run since the late 1990s, arguing that a machine with a real history is a different proposition from a paper concept. Observers note that the schedule advantage of a modernized design is exactly this: the evidence already exists and the review is about the modernization rather than about the physics.'
	},
	{
		slug: 'academy-first-cohort',
		title: 'Operations Academy takes its first cohort',
		outlet: 'Company news',
		published_at: '2026-02-11',
		featured: false,
		body:
			'The Operations Academy has taken its first cohort of trainee operators in Rotterdam. Because Zettajoule sells energy rather than reactors, every module it deploys is staffed by its own crew, and the Academy is how those crews are made. The programme runs simulator work against the digital twin of the module alongside classroom time on reactor physics, helium systems and the operating envelope. Graduates carry a Zettajoule control room qualification and go on to a deployment. The second cohort opens for applications in the summer.'
	},
	{
		slug: 'desalination-study',
		title: 'Desalination study opens in the Gulf',
		outlet: 'Water Report',
		published_at: '2026-01-20',
		featured: false,
		body:
			'A feasibility study opening this month examines two Zettajoule modules driving multi-effect distillation for a Gulf coastal city, delivering fresh water on reactor heat rather than burned gas. Thermal desalination is a heat problem before it is a water problem, and the study will size the effects against the module output, test the coastal siting case and price the water against the incumbent gas-fired plant. Where water scarcity and power scarcity arrive together, the sponsors argue, one energy contract can answer both.'
	},
	{
		slug: 'helium-supply-signed',
		title: 'Helium supply agreement signed',
		outlet: 'Company news',
		published_at: '2025-11-05',
		featured: false,
		body:
			'Zettajoule has signed a multi-year helium supply agreement covering the test loop programme and the first deployments. Helium is the coolant that lets the design run hot while staying chemically calm around every surface it touches, and securing it early removes a supply question from the deployment schedule. The agreement includes recovery and recycling provisions, since the inventory in a closed primary circuit is small and is meant to stay in the machine.'
	}
];

const TEAM = [
	{
		slug: 'mira-halvorsen',
		name: 'Mira Halvorsen',
		role_title: 'Chief Executive',
		bio:
			'Mira has spent twenty years turning energy engineering into energy contracts, most of it in industrial supply rather than in utilities. She came to Zettajoule from a heat and power developer where she built the ownership model this company now runs on: the customer buys energy, we keep the machine. She reads a term sheet and a heat balance with the same attention and expects the two to agree.',
		profile_url: 'https://example.com/profiles/mira-halvorsen',
		sort_order: 1
	},
	{
		slug: 'tobias-ruiz',
		name: 'Tobias Ruiz',
		role_title: 'Chief Technology Officer',
		bio:
			'Tobias is a gas-cooled reactor engineer who worked on the test reactor whose operating record our design modernizes. He argues, at length and with evidence, that the interesting part of a high-temperature machine is not the peak number but the hours it holds it. He leads the helium loop programme and the digital twin work, and he is the reason every component sees its duty on a rig before it sees a site.',
		profile_url: 'https://example.com/profiles/tobias-ruiz',
		sort_order: 2
	},
	{
		slug: 'anneke-vos',
		name: 'Anneke Vos',
		role_title: 'Head of Licensing',
		bio:
			'Anneke has taken first-of-a-kind submissions through three regulators and has the scars to prove which arguments survive. She built the Zettajoule licensing case around the proven ancestor of the design, on the principle that a regulator asked to review a modernization is being asked a smaller question than one asked to review a concept. She insists the safety case is written before the marketing.',
		profile_url: 'https://example.com/profiles/anneke-vos',
		sort_order: 3
	},
	{
		slug: 'daniel-okoye',
		name: 'Daniel Okoye',
		role_title: 'Head of Operations Academy',
		bio:
			'Daniel ran control rooms for fifteen years before he built the training programme that staffs ours. Since Zettajoule operates every module it deploys, the Academy is a core part of the product rather than a support function, and Daniel sets the qualification a Zettajoule operator holds. He takes every cohort through the simulator himself at least once.',
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
		question: 'What kind of reactor is a Zettajoule module?',
		answer:
			'It is a high-temperature gas-cooled reactor, helium cooled and graphite moderated, delivering 250 MW thermal a module at 750 degrees Celsius at the outlet. The design modernizes a test reactor that has been operating since the late 1990s rather than starting from a blank sheet.',
		category: 'Technology'
	},
	{
		question: 'Why does the outlet temperature matter so much?',
		answer:
			'Ordinary water-cooled reactors top out around 300 degrees Celsius, which rules them out of most industrial heat. At 750 degrees Celsius the module reaches process heat, high-temperature electrolysis and the hydrogen route to steel, so it can do jobs a water-cooled machine simply cannot.',
		category: 'Technology'
	},
	{
		question: 'What is the fuel and why is it safe at that temperature?',
		answer:
			'The fuel is tiny uranium grains wrapped in tough ceramic shells. Each shell is its own containment and holds together at temperatures well beyond anything the reactor reaches in normal operation or in an accident, so the fission products stay inside the particle rather than relying on an outer barrier.',
		category: 'Technology'
	},
	{
		question: 'How long does a deployment take?',
		answer:
			'The modules are factory built and shipped, so site work is preparation and connection rather than construction of a reactor. That is the point of modular deployment: the schedule is set by the factory and the licence, not by pouring concrete on a bespoke site.',
		category: 'Deployment'
	},
	{
		question: 'Do we have to own or operate the reactor?',
		answer:
			'No. Zettajoule owns the modules, runs them and staffs them with crews trained in our own Operations Academy. The customer signs an energy supply contract and buys heat, hydrogen or electricity. You never become a nuclear operator.',
		category: 'Deployment'
	},
	{
		question: 'Can we start with one module and add more later?',
		answer:
			'Yes. Single-module and multi-module deployments are both standard, and the explorer marks which shape each industry usually takes. Capacity is added by adding a module rather than by rebuilding the installation, so growth does not mean a second project.',
		category: 'Deployment'
	}
];

async function upsertMany(client, table, cols, conflictCols, rows) {
	for (const row of rows) {
		const values = cols.map((c) => row[c]);
		const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
		const updates = cols
			.filter((c) => !conflictCols.includes(c))
			.map((c) => `${c} = EXCLUDED.${c}`)
			.join(', ');
		await client.query(
			`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (${conflictCols.join(', ')}) DO UPDATE SET ${updates}`,
			values
		);
	}
}

export async function migrateAndSeed(pool) {
	const client = await pool.connect();
	try {
		await client.query(SCHEMA_SQL);
		// Serialize seeding across replicas / restarts.
		await client.query('SELECT pg_advisory_lock($1)', [918273645]);
		try {
			await seedAll(client);
		} finally {
			await client.query('SELECT pg_advisory_unlock($1)', [918273645]);
		}
	} finally {
		client.release();
	}
}

async function seedAll(client) {
	const hash = await hashPassword(SEED_PASSWORD);

	for (const acc of [
		{ email: 'visitor@example.com', display_name: 'Ada Moreau' },
		{ email: 'visitor2@example.com', display_name: 'Ken Adeyemi' }
	]) {
		await client.query(
			`INSERT INTO accounts (email, password_hash, display_name) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name`,
			[acc.email, hash, acc.display_name]
		);
	}

	await upsertMany(
		client,
		'solutions',
		['slug', 'industry', 'title', 'summary', 'detail', 'output_kind', 'temperature_band', 'deployment', 'module_count'],
		['slug'],
		SOLUTIONS
	);
	await upsertMany(client, 'documents', ['slug', 'title', 'category', 'published_at'], ['slug'], DOCUMENTS);
	await upsertMany(client, 'jobs', ['slug', 'title', 'location', 'team', 'description'], ['slug'], JOBS);
	await upsertMany(
		client,
		'stories',
		['slug', 'title', 'outlet', 'published_at', 'featured', 'body'],
		['slug'],
		STORIES
	);
	await upsertMany(
		client,
		'team_members',
		['slug', 'name', 'role_title', 'bio', 'profile_url', 'sort_order'],
		['slug'],
		TEAM
	);
	await upsertMany(client, 'offices', ['city', 'country', 'role_label'], ['city'], OFFICES);
	await upsertMany(client, 'faqs', ['question', 'answer', 'category'], ['question'], FAQS);

	const idOf = async (table, slug) => {
		const r = await client.query(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
		return r.rows[0]?.id;
	};
	const accountOf = async (email) => {
		const r = await client.query('SELECT id FROM accounts WHERE email = $1', [email]);
		return r.rows[0]?.id;
	};

	const ada = await accountOf('visitor@example.com');
	const ken = await accountOf('visitor2@example.com');

	for (const [accountId, slug] of [
		[ada, 'steel'],
		[ada, 'data-centres'],
		[ken, 'mining']
	]) {
		const solutionId = await idOf('solutions', slug);
		await client.query(
			`INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1,$2)
       ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING`,
			[accountId, solutionId]
		);
	}

	await client.query(
		`INSERT INTO saved_searches (account_id, name, query, output_kind) VALUES ($1,$2,$3,$4)
     ON CONFLICT (account_id, name) DO UPDATE SET output_kind = EXCLUDED.output_kind`,
		[ada, 'Hydrogen sites', null, 'hydrogen']
	);

	for (const e of [
		{
			reference: 'ENQ-7K2M9QD4',
			account_id: ada,
			name: 'Ada Moreau',
			email: 'visitor@example.com',
			phone_country: '+31',
			phone: '6 1234 5678',
			topic: 'Investor relations',
			message:
				'We are reviewing the module programme ahead of a partner meeting and would like the current deck and the licensing timeline.',
			status: 'answered'
		},
		{
			reference: 'ENQ-5R8X1CJ2',
			account_id: ken,
			name: 'Ken Adeyemi',
			email: 'visitor2@example.com',
			phone_country: '+1',
			phone: '312 555 0148',
			topic: 'Careers',
			message:
				'I am a licensed operator looking at the Operations Academy. What does a cohort commit to and when does the next one open?',
			status: 'received'
		}
	]) {
		await client.query(
			`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (reference) DO NOTHING`,
			[e.reference, e.account_id, e.name, e.email, e.phone_country, e.phone, e.topic, e.message, e.status]
		);
	}

	for (const r of [
		{
			reference: 'IAR-4H7N2PQ8',
			account_id: ada,
			organisation: 'Moreau Capital Partners',
			role_title: 'Managing Partner',
			status: 'approved'
		},
		{
			reference: 'IAR-9T3V6BLM',
			account_id: ken,
			organisation: 'Adeyemi Industrial Group',
			role_title: 'Head of Strategy',
			status: 'pending'
		}
	]) {
		await client.query(
			`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (account_id) DO NOTHING`,
			[r.reference, r.account_id, r.organisation, r.role_title, r.status]
		);
	}

	// Exactly one featured story.
	await client.query(`UPDATE stories SET featured = (slug = 'first-module-order')`);
}
