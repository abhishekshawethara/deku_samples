import { q } from './db.js';
import { hashPassword } from './auth.js';

export const DEMO_PASSWORD = 'deku-demo-pw-2026';

const ACCOUNTS = [
	{ email: 'visitor@example.com', display_name: 'Ada Moreau' },
	{ email: 'visitor2@example.com', display_name: 'Ken Adeyemi' }
];

const SOLUTIONS = [
	{
		slug: 'oil-and-gas',
		industry: 'Oil and Gas',
		title: 'Process heat for refining and upgrading',
		summary:
			'Steady high-grade process heat replaces fired heaters across refining, upgrading and heavy oil recovery, with no combustion on the site boundary.',
		detail:
			'Refineries burn gas to make heat, and that heat is the largest single source of emissions on the site. A multi-module installation delivers steam and hot gas into the existing header at the temperatures crackers, reformers and distillation trains already run on, so the process side is untouched. Four modules cover a mid-size refinery, and the plant buys energy rather than a reactor: Zettajoule owns the modules, runs them and staffs them. Heavy oil recovery uses the same heat for steam flooding, where the alternative is burning a share of the product itself.',
		output_kind: 'heat',
		temperature_band: '250 to 550 C',
		deployment: 'multi-module',
		module_count: 4
	},
	{
		slug: 'chemicals',
		industry: 'Chemicals',
		title: 'Heat and power for continuous chemical plants',
		summary:
			'Chemical sites run continuously and need heat and electricity together; three modules carry both without a break in supply.',
		detail:
			'A cracker or an ammonia plant cannot ride out an interruption, so the supply has to be as steady as the process. Three modules deliver process heat in the 550 to 750 C band alongside the electrical load of compressors and pumps, from one installation with one interface. The helium loop carries heat out at a temperature high enough for endothermic chemistry that water-cooled plant cannot reach, and the electrical side is taken from the same thermal source rather than bought separately. Sites already holding steam headers connect without redesigning the process.',
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
			'High-temperature hydrogen production for freight, shipping and aviation fuel routes, sized at six modules for a corridor hub.',
		detail:
			'Heavy transport does not electrify easily, and the fuels that replace diesel and kerosene all start with hydrogen. High-temperature electrolysis run off a 750 C outlet needs meaningfully less electricity per kilogram than a cold stack, because the heat does part of the work the electricity would otherwise do. Six modules at a corridor hub feed a fuelling network, a port bunkering operation or a synthetic fuel plant. The hydrogen is produced where it is used, so it does not have to be trucked or liquefied first.',
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
			'The hydrogen route to primary steel, at the scale a full works needs: eight modules feeding direct reduction in place of coke.',
		detail:
			'Primary steel is made by pulling oxygen out of iron ore, and coke has done that job for two centuries at the cost of a tonne of carbon dioxide for roughly every tonne of steel. Hydrogen does the same reduction and leaves water. The obstacle has always been hydrogen at the volume and price a works consumes, which is where eight modules of high-temperature production come in: the heat drives the reduction shaft and the electrolysis together. The works buys hydrogen and heat under contract; Zettajoule owns and operates the modules on site.',
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
			'One module replaces the diesel gensets that power a remote mine, with no fuel convoy and no seasonal price exposure.',
		detail:
			'Remote mines run on diesel trucked in over long distances, and the fuel line is both the biggest operating cost and the biggest single point of failure. One module delivers firm electricity for the mill, the hoists and the camp, sized at 100 MW electrical, and it runs through the season without resupply. Electrified haulage becomes possible once the power is there. Because the module is owned and staffed by Zettajoule, the mine carries no nuclear operating obligation of its own: it buys megawatt hours.',
		output_kind: 'electricity',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'data-centres',
		industry: 'Data Centres',
		title: 'Around the clock power for compute campuses',
		summary:
			'Two modules carry a compute campus on firm, carbon-free electricity that does not depend on the grid queue.',
		detail:
			'Compute demand has outrun the pace at which grid connections are granted, and a campus that cannot be connected cannot be built. Two modules give a campus 200 MW electrical behind the meter, available continuously rather than when the weather allows, which is what a training cluster at full utilisation actually requires. Waste heat leaves at a temperature useful for a district network, so the site can sell what it cannot use. The operator signs a power agreement and never touches the reactor.',
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
			'A single module warms a district network and supplies its electricity, replacing a coal or gas heat plant in place.',
		detail:
			'Towns across the cold parts of the world are heated from a central plant that burns coal or gas, and the network of pipes is already in the ground. One module drops into that plant room role: hot water into the existing network at the temperature it was designed for, electricity onto the local grid, and the pipework untouched. The workforce that ran the old plant is retrained through the Operations Academy and stays employed on the new one. The town buys heat and power, as it always did.',
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
			'Two modules drive multi-effect distillation for a coastal city, turning seawater into supply without burning gas for it.',
		detail:
			'Desalination in the Gulf and around the Mediterranean is largely thermal, and the heat comes from gas. Two modules supply the 250 to 550 C band that multi-effect distillation and thermal vapour compression want, at a scale that covers a city, with the electrical side of the plant taken from the same source. Fresh water output tracks demand through the summer peak because the heat supply does not vary with weather or fuel price. A study is open on a Gulf site now.',
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
			'The full case: market sizing for industrial heat, the energy-as-a-service model, unit economics per module and the funding path to first deployment.',
		published_at: '2026-06-30'
	},
	{
		slug: 'technology-dossier',
		title: 'Technology Dossier',
		category: 'Technology',
		summary:
			'Reactor physics, TRISO fuel qualification data, the helium loop, the digital twin programme and the operating record of the reference test reactor.',
		published_at: '2026-05-12'
	},
	{
		slug: 'licensing-roadmap',
		title: 'Licensing Roadmap',
		category: 'Regulatory',
		summary:
			'Jurisdiction by jurisdiction: the pre-application steps cleared, the design certification path and the dated schedule to a construction permit.',
		published_at: '2026-04-02'
	}
];

const JOBS = [
	{
		slug: 'reactor-systems-engineer',
		title: 'Reactor Systems Engineer',
		location: 'Rotterdam',
		team: 'Engineering',
		description:
			'Own the primary helium loop and its interfaces from design through commissioning. You will size and specify circulators, heat exchangers and instrumentation, run the thermal-hydraulic cases that support the safety analysis, and work alongside the digital twin team so the model and the metal agree. We are looking for someone who has taken a system through a real commissioning campaign, in nuclear, process or aerospace, and who writes things down clearly enough that a licensing reviewer can follow them.'
	},
	{
		slug: 'licensing-lead',
		title: 'Licensing Lead',
		location: 'Chicago',
		team: 'Regulatory',
		description:
			'Carry the design through a regulator, in the United States first and then in parallel elsewhere. You will build the licensing basis on the operating record of an existing high-temperature reactor rather than on a paper concept, own the pre-application engagement, and turn engineering evidence into the documents a reviewer needs. Experience of a design certification or construction permit process, and the judgement to know which arguments hold, matter more here than years served.'
	},
	{
		slug: 'operations-trainer',
		title: 'Operations Trainer',
		location: 'Rotterdam',
		team: 'Operations Academy',
		description:
			'We staff the reactors we own, which means we have to train the people who run them. You will build the curriculum and the simulator exercises that take an experienced process or power plant operator to a licensed high-temperature gas-cooled reactor operator, and you will teach the first cohorts yourself. Operating experience at a nuclear or heavy process plant is essential; a track record of teaching adults who already know their trade is what sets the strongest candidate apart.'
	}
];

const STORIES = [
	{
		slug: 'first-module-order',
		title: 'First module order signed',
		outlet: 'Company news',
		published_at: '2026-08-18',
		featured: true,
		body: 'Zettajoule has signed its first firm module order, covering a multi-module installation for an industrial customer in the Netherlands under a fifteen year energy supply agreement. The customer buys heat and electricity by the unit; Zettajoule owns, operates and staffs the modules on the customer site, which keeps the nuclear operating obligation with the company that has built its organisation around it.\n\nThe order follows an eighteen month engineering study that mapped the site\'s existing steam header against the module outlet conditions and concluded that the process side needs no redesign. Long lead procurement for the pressure vessel and the primary circulators begins immediately, and the first fuel load is scheduled against the licensing milestones set out in the roadmap published earlier in the year.\n\n"An order is the only proof that matters," said chief executive Mira Halvorsen. "A customer has read the same safety case a regulator is reading and decided to buy fifteen years of energy from it. Everything else we have said about this technology is now something we have to deliver."'
	},
	{
		slug: 'helium-loop-milestone',
		title: 'Helium loop completes a 1000 hour run',
		outlet: 'Company news',
		published_at: '2026-07-02',
		body: 'The primary loop test rig at the Rotterdam engineering hall has completed a continuous 1000 hour run at full outlet temperature, closing the last of the endurance objectives set for the programme this year. The rig circulates helium through a full scale section of the primary circuit, holding 750 C at the outlet while the instrumentation records circulator behaviour, seal performance and heat exchanger effectiveness against the model.\n\nThe result that mattered most was the one that did not move. Measured effectiveness at hour 1000 sat within the band recorded in the first week, which is the evidence needed to argue that the loop does not degrade in service in the way an air or steam circuit would. Helium is chemically inert and stays that way around everything it touches, and a thousand hours of data is how that claim stops being a statement about chemistry and becomes a statement about this machine.\n\nThe rig now moves into thermal cycling, ramping between hot and cold conditions to represent the load following an industrial customer will ask for.'
	},
	{
		slug: 'steel-partnership',
		title: 'Steel partnership targets the hydrogen route',
		outlet: 'Industry Week',
		published_at: '2026-05-14',
		body: 'A European steelmaker and Zettajoule have opened a joint study into supplying an eight module installation to a primary steel works, feeding hydrogen and process heat into a direct reduction shaft in place of coke. The hydrogen route to primary steel is well understood chemically and has never been constrained by the chemistry; it has been constrained by the price and the volume of hydrogen a full works consumes.\n\nHigh-temperature electrolysis driven from a 750 C outlet is the part of the proposal the industry has been waiting to see costed. Because the heat does work the electricity would otherwise have to do, the electrical demand per kilogram of hydrogen falls against a cold stack, and at works scale that difference is the difference between a demonstration and a business.\n\nThe study will report on siting, hydrogen storage buffering and the commercial structure, under which the works would buy hydrogen and heat under contract rather than own generating plant.'
	},
	{
		slug: 'licensing-step-cleared',
		title: 'Licensing step cleared',
		outlet: 'Energy Monitor',
		published_at: '2026-03-09',
		body: 'Zettajoule has closed out the pre-application review step with its lead regulator, clearing the way for the formal design submission later in the year. The step examined the safety case at the level of principle: how the design removes decay heat without operator action or external power, how the fuel behaves at temperatures beyond anything the plant would see in service, and what the operating record of the existing reference reactor is admissible to demonstrate.\n\nThat last question is the one the company has built its licensing strategy around. The design is a modernized version of a high-temperature gas-cooled reactor that has operated since the late 1990s, and the head of licensing, Anneke Vos, has argued throughout that a reviewer assessing measured behaviour from an operating machine is doing a materially different job from a reviewer assessing a concept on paper.\n\nNo formal approval attaches to a pre-application step. What it establishes is that the reviewers and the applicant agree on what evidence the submission has to contain.'
	},
	{
		slug: 'academy-first-cohort',
		title: 'Operations Academy takes its first cohort',
		outlet: 'Company news',
		published_at: '2026-02-11',
		body: 'The Operations Academy has taken its first cohort of twenty four trainees at the Rotterdam campus, beginning the programme that will staff the modules Zettajoule owns and runs. The intake is drawn mostly from process industry and conventional power operations, with a smaller group from the naval propulsion world, and every one of them arrives already knowing what it is to hold a plant in a stable condition through a night shift.\n\nThe curriculum runs eighteen months across reactor physics, helium systems, the digital twin and simulator time, ending in the licensed operator qualification. Daniel Okoye, who heads the academy, describes the design principle as teaching a new machine to people who already have the trade rather than teaching the trade itself.\n\nStaffing is not a side activity for the company. Selling energy rather than reactors means Zettajoule carries the operating obligation on every site, and the academy is how that obligation is met.'
	},
	{
		slug: 'desalination-study',
		title: 'Desalination study opens in the Gulf',
		outlet: 'Water Report',
		published_at: '2026-01-20',
		body: 'A feasibility study has opened with a Gulf water authority into a two module installation driving multi-effect distillation for a coastal city. Thermal desalination in the region runs largely on gas, which ties the price of water to the price of fuel and puts a substantial emissions burden behind a utility that most residents never think about.\n\nThe study covers the 250 to 550 C heat supply into the distillation plant, the electrical demand of the intake and brine systems taken from the same source, and the behaviour of the whole through the summer demand peak when the plant runs hardest. Output tracks demand rather than fuel price or weather, which is the operational argument alongside the emissions one.\n\nSiting work considers seawater intake, brine discharge and the coastal setback the modules require, and reports at the end of the year.'
	},
	{
		slug: 'helium-supply-signed',
		title: 'Helium supply agreement signed',
		outlet: 'Company news',
		published_at: '2025-11-05',
		body: 'Zettajoule has signed a long term helium supply and reserve agreement covering the initial fleet, securing both the first fill for each module and the replenishment volumes the loops require over their operating lives. Helium is the coolant, and its inventory is a supply chain question rather than a technical one: the gas is chemically inert, does not activate meaningfully and does not attack the graphite or the metals it circulates around, which is precisely why it was chosen.\n\nThe agreement includes a strategic reserve held against market disruption, a term the company pursued after reviewing the price volatility of the last decade. Procurement now moves to the graphite and TRISO fuel supply chains, where qualification of the supplier is inseparable from qualification of the material.'
	}
];

const TEAM = [
	{
		slug: 'mira-halvorsen',
		name: 'Mira Halvorsen',
		role_title: 'Chief Executive',
		bio: 'Mira has spent twenty five years delivering large energy infrastructure, most of it on the side of the table where the schedule is either met or explained. She led offshore wind construction programmes through the decade in which that industry stopped being expensive and became ordinary, and she joined Zettajoule because she believes industrial heat is the next thing to make that transition. She argues, at length if allowed, that selling energy rather than reactors is the decision that makes the rest of the company coherent: it puts the operating risk with the people who understand the machine and leaves the customer buying something they already know how to buy.',
		profile_url: 'https://example.com/team/mira-halvorsen'
	},
	{
		slug: 'tobias-ruiz',
		name: 'Tobias Ruiz',
		role_title: 'Chief Technology Officer',
		bio: 'Tobias is a reactor physicist who worked on high-temperature gas-cooled systems when almost nobody was funding them, including two years on secondment to the test reactor whose operating record now underpins the company\'s safety case. He is responsible for the design being a modernization rather than an invention, a position he defends on the grounds that novelty is a cost paid at the regulator and recovered from nobody. His current preoccupation is the digital twin: a living model of each module, fed by its own instrumentation, accurate enough to find a developing problem before a human would.',
		profile_url: 'https://example.com/team/tobias-ruiz'
	},
	{
		slug: 'anneke-vos',
		name: 'Anneke Vos',
		role_title: 'Head of Licensing',
		bio: 'Anneke came to the company from a national regulator, where she assessed advanced reactor submissions and developed a low tolerance for applicants who mistake enthusiasm for evidence. She now builds the case from the other side, in several jurisdictions at once, on the argument that a design derived from an operating machine gives a reviewer measured behaviour to assess instead of a projection to believe. She is unromantic about the work: licensing is the schedule, and every engineering decision is eventually a licensing decision.',
		profile_url: 'https://example.com/team/anneke-vos'
	},
	{
		slug: 'daniel-okoye',
		name: 'Daniel Okoye',
		role_title: 'Head of Operations Academy',
		bio: 'Daniel ran conventional and nuclear plant for two decades and holds the view that a plant is only as good as the shift on duty at four in the morning. He built the Operations Academy from that conviction, designing an eighteen month programme that takes experienced process and power operators to licensed high-temperature reactor operators without pretending they are beginners. Because Zettajoule staffs every module it owns, his intake schedule is a constraint on the deployment schedule, a fact he mentions in most meetings.',
		profile_url: 'https://example.com/team/daniel-okoye'
	}
];

const OFFICES = [
	{ city: 'Rotterdam', country: 'Netherlands', role_label: 'Headquarters' },
	{ city: 'Chicago', country: 'United States', role_label: 'Licensing' },
	{ city: 'Tokyo', country: 'Japan', role_label: 'Engineering' }
];

const FAQS = [
	{
		question: 'What kind of reactor is it?',
		answer:
			'A high-temperature gas-cooled reactor. Each module delivers 250 MW thermal and holds 750 degrees Celsius at the outlet, which is hot enough for industrial processes that water-cooled reactors cannot serve. The design is a modernized version of a reactor that has been operating since the late 1990s rather than a new concept.',
		category: 'Technology'
	},
	{
		question: 'What is the fuel and why does it hold at extreme heat?',
		answer:
			'Tiny grains of uranium are wrapped in layers of carbon and silicon carbide, forming particles a fraction of a millimetre across. Each shell is a pressure vessel in its own right, and it holds its fission products in at temperatures well beyond anything the reactor would reach in service. The fuel is its own containment, and that is the foundation of the safety case.',
		category: 'Technology'
	},
	{
		question: 'Why helium rather than water?',
		answer:
			'Helium is chemically inert, so it does not corrode the metals or attack the graphite it circulates around, and it stays a gas at any temperature the reactor reaches, so there is no phase change and no pressurised water chemistry to manage. It also carries heat out at 750 degrees Celsius, which water cannot do at practical pressures.',
		category: 'Technology'
	},
	{
		question: 'Do we have to buy and operate a reactor?',
		answer:
			'No. Zettajoule owns the modules, runs them and staffs them with operators trained through its own Operations Academy. The customer buys heat, hydrogen or electricity by the unit under a supply agreement, so the nuclear operating obligation stays with the company built around it.',
		category: 'Deployment'
	},
	{
		question: 'How many modules does a site need?',
		answer:
			'It follows the load. One module covers a remote mine, a district heat network or a small campus; two to four suit a data centre campus, a desalination plant or a refinery; a primary steel works on the hydrogen route needs eight. The calculator turns a stated need in megawatts into a module count, and the solutions explorer lists the eight industries with their typical sizing.',
		category: 'Deployment'
	},
	{
		question: 'How long does deployment take, and can a site grow later?',
		answer:
			'Modules are built in a factory and assembled on site, which is what makes the schedule predictable and short compared with bespoke construction. Because capacity comes in module-sized steps, a site can start with what it needs today and add modules as demand grows, without redesigning the installation.',
		category: 'Deployment'
	}
];

async function upsertRows(table, conflictCols, rows) {
	if (!rows.length) return;
	const cols = Object.keys(rows[0]);
	const updates = cols.filter((c) => !conflictCols.includes(c));
	for (const row of rows) {
		const values = cols.map((c) => row[c]);
		const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
		const setClause = updates.length
			? `DO UPDATE SET ${updates.map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ')}`
			: 'DO NOTHING';
		await q(
			`INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})
       ON CONFLICT (${conflictCols.map((c) => `"${c}"`).join(', ')}) ${setClause}`,
			values
		);
	}
}

async function idOf(table, slugCol, slug) {
	const r = await q(`SELECT id FROM ${table} WHERE ${slugCol} = $1`, [slug]);
	return r.rows[0]?.id ?? null;
}

export async function seed(log = console.log) {
	// accounts: never rewrite a password hash that already exists
	for (const a of ACCOUNTS) {
		await q(
			`INSERT INTO accounts (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name`,
			[a.email, hashPassword(DEMO_PASSWORD), a.display_name]
		);
	}

	await upsertRows(
		'solutions',
		['slug'],
		SOLUTIONS.map((s, i) => ({ ...s, sort_order: i }))
	);
	await upsertRows('documents', ['slug'], DOCUMENTS);
	await upsertRows(
		'jobs',
		['slug'],
		JOBS.map((j, i) => ({ ...j, sort_order: i }))
	);
	await upsertRows(
		'stories',
		['slug'],
		STORIES.map((s) => ({ ...s, featured: s.featured === true }))
	);
	await upsertRows(
		'team_members',
		['slug'],
		TEAM.map((t, i) => ({ ...t, sort_order: i }))
	);
	await upsertRows('offices', ['city'], OFFICES);
	await upsertRows(
		'faqs',
		['question'],
		FAQS.map((f, i) => ({ ...f, sort_order: i }))
	);

	// exactly one featured story
	await q(`UPDATE stories SET featured = false WHERE slug <> 'first-module-order' AND featured`);
	await q(`UPDATE stories SET featured = true WHERE slug = 'first-module-order'`);

	const ada = await idOf('accounts', 'email', 'visitor@example.com');
	const ken = await idOf('accounts', 'email', 'visitor2@example.com');
	const steel = await idOf('solutions', 'slug', 'steel');
	const dataCentres = await idOf('solutions', 'slug', 'data-centres');
	const mining = await idOf('solutions', 'slug', 'mining');

	for (const [acct, sol] of [
		[ada, steel],
		[ada, dataCentres],
		[ken, mining]
	]) {
		await q(
			`INSERT INTO saved_solutions (account_id, solution_id) VALUES ($1, $2)
       ON CONFLICT (account_id, solution_id) WHERE account_id IS NOT NULL DO NOTHING`,
			[acct, sol]
		);
	}

	await q(
		`INSERT INTO saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
     VALUES ($1, 'Hydrogen sites', NULL, NULL, 'hydrogen', NULL, NULL)
     ON CONFLICT (account_id, name) DO UPDATE SET output_kind = EXCLUDED.output_kind`,
		[ada]
	);

	await q(
		`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (reference) DO NOTHING`,
		[
			'ENQ-7K2M9QD4',
			ada,
			'Ada Moreau',
			'visitor@example.com',
			'+31',
			'6 1234 5678',
			'Investor relations',
			'I would like to understand the funding path to first deployment and how the energy supply agreements are structured before the data room review.',
			'answered'
		]
	);
	await q(
		`INSERT INTO enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (reference) DO NOTHING`,
		[
			'ENQ-5R8X1CJ2',
			ken,
			'Ken Adeyemi',
			'visitor2@example.com',
			'+1',
			'312 555 0148',
			'Careers',
			'Does the Operations Academy take applicants from conventional power generation, and when does the next cohort start?',
			'received'
		]
	);

	await q(
		`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (account_id) DO NOTHING`,
		['IAR-4H7N2PQ8', ada, 'Meridian Capital Partners', 'Managing Partner', 'approved']
	);
	await q(
		`INSERT INTO access_requests (reference, account_id, organisation, role_title, status)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (account_id) DO NOTHING`,
		['IAR-9T3V6BLM', ken, 'Northline Industrial Group', 'Head of Energy Strategy', 'pending']
	);

	log('seed complete');
}
