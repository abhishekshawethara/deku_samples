import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { SCHEMA_SQL } from './schema.js';

export const DEMO_PASSWORD = 'deku-demo-pw-2026';

const SOLUTIONS = [
	{
		slug: 'oil-and-gas',
		industry: 'Oil and Gas',
		title: 'Process heat for refining and upgrading',
		summary:
			'Steady high-grade process heat replaces fired heaters across refining, upgrading and heavy oil recovery, with no combustion on the site boundary.',
		detail:
			'Refineries burn fuel gas to make heat. A four module block delivers 1000 MW thermal of that heat directly from helium, at a temperature the process already runs at, so the fired heaters come out and the flue stack goes quiet.\n\nBlock one, the heat source: four modules feed a common helium header at 750 degrees Celsius. Block two, transfer: a secondary loop moves heat to steam generators and to direct process exchangers, keeping the nuclear side separated from the plant side by two barriers. Block three, delivery: superheated steam and hot oil circuits arrive at the existing headers, so the process units downstream see no change. Block four, resilience: with four modules a single unit can be taken off for refuelling while the remaining three carry base heat.\n\nZettajoule owns, runs and staffs the block. The refinery buys heat by the gigajoule on a long term contract and keeps its own operators on its own process.',
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
			'A three module block carries both the process heat and the electrical load of a continuous chemical site, with the temperature headroom that cracking and reforming demand.',
		detail:
			'Chemical sites want two things at once and cannot afford to lose either. Steam for reaction and separation, electricity for compression and pumping. A three module block delivers 750 MW thermal, split between direct process steam and a turbine set.\n\nBlock one, the source: three modules at 750 degrees Celsius outlet, enough headroom for cracking duties that a water cooled reactor cannot reach. Block two, the split: an extraction turbine takes what the site needs as power and passes the rest through as process steam, so the ratio follows the plant rather than the reactor. Block three, integration: the block ties into the existing steam header and the site substation, and rides through a grid outage because it is not the grid. Block four, turndown: modules are dispatched individually, so a plant at part load is not carrying a reactor at full output.\n\nThe reactor is a modernized version of a design that has run as a test reactor since the late 1990s, which is what makes this deployable rather than notional.',
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
			'Six modules drive high-temperature electrolysis for road, rail, marine and aviation fuel, using heat as well as electricity so less electricity is needed per kilogram.',
		detail:
			'Hydrogen made by ordinary electrolysis pays for every kilogram in electricity alone. High-temperature steam electrolysis lets heat do part of the work, and heat is the thing this reactor has most of.\n\nBlock one, the source: six modules, 1500 MW thermal, on a corridor site with rail and water access. Block two, steam raising: reactor heat makes the steam the cells split, so a meaningful share of the energy of dissociation arrives as heat rather than as electricity. Block three, the cells: solid oxide stacks run at the band the reactor already delivers, cutting the electrical demand per kilogram against a low-temperature stack. Block four, delivery: compression, storage and dispensing for trucks and trains on site, with liquefaction for marine and aviation offtake.\n\nOutput is firm because the heat source is firm. A corridor refuelling network cannot be built on a supply that stops when the weather changes.',
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
			'Eight modules feed the hydrogen route to steel, replacing coke in direct reduction with hydrogen made on site from reactor heat and electricity.',
		detail:
			'The hydrogen route to steel replaces carbon with hydrogen in the reduction shaft. It works. What it lacks is hydrogen at the scale and the price a mill needs, every hour, for decades.\n\nBlock one, the source: eight modules, 2000 MW thermal, sited with the mill. Block two, hydrogen: high-temperature steam electrolysis, where reactor heat supplies part of the energy so each kilogram costs less electricity than a low-temperature stack. Block three, the shaft: hydrogen reduces iron ore to direct reduced iron, and the off gas is recycled rather than vented as carbon dioxide. Block four, the melt: the electric arc furnace draws power from the same block, so hydrogen and electricity arrive under one contract from one owner.\n\nA mill making three million tonnes a year is a continuous load. Eight modules staged in pairs let the mill convert one line at a time rather than shutting down to change everything at once.',
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
			'One module replaces the diesel gensets that power a remote mine, delivering 100 MW electrical without a fuel convoy.',
		detail:
			'A remote mine runs on diesel trucked in over roads that close. Fuel is the second largest line on the cost sheet and the largest source of emissions on the licence.\n\nBlock one, the source: a single module, 250 MW thermal, 100 MW electrical, delivered as factory built sections. Block two, conversion: the power block ties into the mine substation and carries crushing, grinding, hoisting and camp load as an island grid. Block three, refuelling: the fuel cycle is measured in years, not in convoys, so the road closing is a logistics matter rather than a production stop. Block four, closure: the module is designed to be removed, and the site restored, on the same schedule as the mine plan.\n\nSingle module deployment is the whole point here. The site does not need 800 MW, and does not want to pay for it.',
		output_kind: 'electricity',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'data-centres',
		industry: 'Data Centres',
		title: 'Firm round-the-clock power for compute campuses',
		summary:
			'Two modules give a compute campus 200 MW electrical of firm, carbon free power on site, matched hour by hour rather than by certificate.',
		detail:
			'A campus that runs at ninety percent utilisation every hour of the year cannot be matched by an annual certificate. It needs carbon free electrons at the moment it draws them.\n\nBlock one, the source: two modules, 500 MW thermal, 200 MW electrical, behind the campus meter. Block two, availability: two modules mean one can be off for maintenance while the other carries load, alongside the grid connection kept as backup rather than as the primary supply. Block three, heat: the reject heat is warm enough for district heating offtake or for absorption cooling on the campus, which turns a rejection problem into a second product. Block four, growth: modules are added as halls are added, so the power plan follows the build plan.\n\nHour by hour matching is a claim the operator can make and defend, because the generation is on the site and under one contract.',
		output_kind: 'electricity',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 2
	},
	{
		slug: 'communities',
		industry: 'Communities',
		title: 'District heat and power for towns and campuses',
		summary:
			'A single module heats homes, hospitals and campuses through a district network while carrying the local electrical load.',
		detail:
			'District heating networks are the cheapest way to decarbonise heating in a dense settlement, and the hardest part is the heat source at the head of the network.\n\nBlock one, the source: one module, 250 MW thermal, sited at the network head. Block two, the split: heat goes to the district network at the flow temperature it was designed for, and the balance goes through a turbine for local electricity. Block three, the network: existing pipes are reused where the flow temperature allows, so the civil works are the substation and the head, not every street. Block four, the winter peak: a heat store charged overnight lets the module carry a morning peak without oversizing the reactor.\n\nThe module is owned, run and staffed by Zettajoule. The municipality buys heat and power, and does not become a nuclear operator.',
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
			'Two modules drive multi-effect distillation and reverse osmosis together, turning seawater into fresh water without burning gas to do it.',
		detail:
			'Most large desalination plants are attached to a gas turbine, because they need heat and power in the same place. That pairing is why water and carbon are on the same bill.\n\nBlock one, the source: two modules, 500 MW thermal, on a coastal site. Block two, the thermal train: multi-effect distillation takes low-grade heat from the back end of the power cycle, which is heat that would otherwise be rejected to the sea. Block three, the membrane train: reverse osmosis takes electricity from the same block, and the two trains are blended to hit the water quality the network wants. Block four, the brine: outfall design and dilution are part of the delivered plant, not an afterthought.\n\nHeat that has already made electricity makes water on its way out. That is where the economics of this pairing sit.',
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
			'Own the helium primary circuit from the core outlet to the steam generator. You will size components, run the thermal hydraulic cases that back the safety argument, and work with the manufacturing team so that what is drawn can actually be built in a factory and shipped on a barge. Experience with gas-cooled systems is welcome and not required; the ability to defend a number in front of a regulator is.'
	},
	{
		slug: 'licensing-lead',
		title: 'Licensing Lead',
		location: 'Chicago',
		team: 'Regulatory',
		description:
			'Carry the licensing case for a modernized high-temperature gas-cooled design in North America. You will build the submission schedule, run the pre-application engagement, and translate between engineers who know the plant and reviewers who know the rules. The design leans on an operating test reactor with a long record, and your work is to make that record count.'
	},
	{
		slug: 'operations-trainer',
		title: 'Operations Trainer',
		location: 'Rotterdam',
		team: 'Operations Academy',
		description:
			'Build the programme that turns qualified engineers into licensed operators of our modules. Because we own and staff the reactors we sell energy from, the Academy is not a support function, it is the supply line. You will write the curriculum, run the simulator sessions and set the standard that every crew is measured against.'
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
			'Zettajoule has signed its first firm module order, covering a four module block on an industrial site in the Netherlands. The block will supply process heat under a long term energy contract, with Zettajoule owning, operating and staffing the plant.\n\nThe order follows eighteen months of joint engineering with the customer, in which the plant integration was worked out against the existing steam header rather than against a blank sheet. Deliveries of factory built sections begin after the licensing step now in progress, and the site works package has been let.\n\n"The customer is not buying a reactor," said the chief executive. "They are buying heat, at a temperature and a price they can plan around, from a company that carries the operating risk."'
	},
	{
		slug: 'helium-loop-milestone',
		title: 'Helium loop completes a 1000 hour run',
		outlet: 'Company news',
		published_at: '2026-07-02',
		featured: false,
		body:
			'The company helium test loop has completed a continuous 1000 hour run at full outlet temperature, closing out the qualification campaign for the primary circuit components.\n\nThe loop ran at 750 degrees Celsius throughout, with the circulator, the isolation valves and the intermediate heat exchanger instrumented for creep, wear and leak rate. No component was replaced during the run and post-run inspection found wear within the predicted band.\n\nThe result feeds directly into the licensing dossier, where component qualification at temperature is one of the questions a reviewer asks first.'
	},
	{
		slug: 'steel-partnership',
		title: 'Steel partnership targets the hydrogen route',
		outlet: 'Industry Week',
		published_at: '2026-05-14',
		featured: false,
		body:
			'A European steelmaker and Zettajoule have agreed to study an eight module block feeding high-temperature steam electrolysis alongside a direct reduction shaft, with the aim of taking coke out of the reduction step entirely.\n\nThe study covers hydrogen cost per kilogram, the staging of modules against the conversion of individual lines, and the electrical supply to the arc furnace. Both parties have said the deciding number is the delivered cost of hydrogen over a twenty year contract, not the capital cost of any one part.\n\nHigh-temperature electrolysis is attractive here because part of the energy of dissociation arrives as heat, and heat is what a gas-cooled reactor has in surplus.'
	},
	{
		slug: 'licensing-step-cleared',
		title: 'Licensing step cleared',
		outlet: 'Energy Monitor',
		published_at: '2026-03-09',
		featured: false,
		body:
			'Regulators have closed out the first formal step in the review of the Zettajoule module, accepting the scope of the safety case and the use of operating data from the reference test reactor.\n\nThe design is a modernized version of a reactor that has operated since the late 1990s, and the acceptance of that operating record as evidence is the point on which the schedule turns. It shortens the argument from a paper concept to a machine with a history.\n\nThe next step covers the fuel qualification package and the passive decay heat removal argument.'
	},
	{
		slug: 'academy-first-cohort',
		title: 'Operations Academy takes its first cohort',
		outlet: 'Company news',
		published_at: '2026-02-11',
		featured: false,
		body:
			'Twenty four engineers have started the first programme at the Zettajoule Operations Academy in Rotterdam, on a route that ends in a licensed operator qualification for the module.\n\nBecause the company owns and staffs the plants whose energy it sells, the Academy is the mechanism by which deployments are crewed. The programme runs classroom, simulator and plant placement phases, and the simulator was built from the same thermal hydraulic models that back the safety case.\n\nA second cohort opens later in the year, weighted towards licensing and radiation protection.'
	},
	{
		slug: 'desalination-study',
		title: 'Desalination study opens in the Gulf',
		outlet: 'Water Report',
		published_at: '2026-01-20',
		featured: false,
		body:
			'A feasibility study has opened on a coastal site in the Gulf, pairing two modules with a combined thermal and membrane desalination train.\n\nThe design takes low-grade heat from the back end of the power cycle into multi-effect distillation, and electricity from the same block into reverse osmosis. The blend of the two trains is set by the water quality the network wants rather than by the limits of either technology alone.\n\nThe study reports next year and covers brine outfall design as part of the delivered plant.'
	},
	{
		slug: 'helium-supply-signed',
		title: 'Helium supply agreement signed',
		outlet: 'Company news',
		published_at: '2025-11-05',
		featured: false,
		body:
			'Zettajoule has signed a multi-year helium supply agreement covering first fill and make-up for the initial module fleet.\n\nHelium is the coolant because it is chemically inert: it does not react with the graphite moderator, with the fuel shells or with the circuit metals at the temperatures the plant runs at, and it does not become a chemistry problem when the plant is hot. Securing supply early removes a commodity question from the deployment schedule.\n\nThe agreement includes recovery and recycling provisions at the plant boundary.'
	}
];

const TEAM = [
	{
		slug: 'mira-halvorsen',
		name: 'Mira Halvorsen',
		role_title: 'Chief Executive',
		bio: 'Mira has spent twenty years selling energy rather than plant, first in offshore wind offtake and then in industrial steam contracts. She came to Zettajoule because the hard part of nuclear is no longer the physics, it is the commercial shape, and the shape she wanted to build is the one this company sells: we own it, we run it, we staff it, and the customer buys the energy. She leads the company from Rotterdam and chairs the deployment review that every module order passes through.',
		profile_url: 'https://www.linkedin.com/in/example-mira-halvorsen',
		sort_order: 1
	},
	{
		slug: 'tobias-ruiz',
		name: 'Tobias Ruiz',
		role_title: 'Chief Technology Officer',
		bio: 'Tobias is a gas-cooled reactor engineer who worked on the reference test reactor that this design modernizes, and he is unusually blunt about what is new and what is not. His position is that the parts a regulator worries about are the parts that already have an operating record, and the parts we have changed are the parts a factory cares about. He owns the helium circuit, the fuel specification and the digital twin programme.',
		profile_url: 'https://www.linkedin.com/in/example-tobias-ruiz',
		sort_order: 2
	},
	{
		slug: 'anneke-vos',
		name: 'Anneke Vos',
		role_title: 'Head of Licensing',
		bio: 'Anneke has taken two reactor designs through regulatory review in two jurisdictions and has the scar tissue to prove it. She runs licensing as a schedule with evidence attached rather than as a document exercise, and she built the argument that lets operating data from the reference reactor stand as evidence in the current submission. She works between Chicago and Rotterdam.',
		profile_url: 'https://www.linkedin.com/in/example-anneke-vos',
		sort_order: 3
	},
	{
		slug: 'daniel-okoye',
		name: 'Daniel Okoye',
		role_title: 'Head of Operations Academy',
		bio: 'Daniel was a licensed operator and then a training manager before he was asked to build the Academy from an empty room. His view is that a company that staffs the reactors it sells energy from has to be able to make operators faster than it makes modules, and everything in the programme follows from that. He built the simulator on the same models that back the safety case.',
		profile_url: 'https://www.linkedin.com/in/example-daniel-okoye',
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
			'A high-temperature gas-cooled reactor. Each module delivers 250 MW thermal, and the helium coolant leaves the core at 750 degrees Celsius. At 40 percent electrical conversion that is 100 MW electrical a module.',
		category: 'Technology'
	},
	{
		question: 'Why helium rather than water?',
		answer:
			'Helium is chemically inert. It does not react with the graphite, the fuel shells or the circuit metals, and it does not limit the outlet temperature the way a water circuit does. That is what lets the module reach 750 degrees Celsius and serve process heat duties a water-cooled reactor cannot.',
		category: 'Technology'
	},
	{
		question: 'What is the fuel and why does it hold at high temperature?',
		answer:
			'Tiny uranium grains, each wrapped in tough ceramic shells that act as their own containment. The shells hold their integrity far above the temperatures the plant ever reaches in normal operation, and the graphite around them carries heat away slowly enough that the core protects itself.',
		category: 'Technology'
	},
	{
		question: 'How long does a deployment take?',
		answer:
			'The modules are factory built and shipped as sections, so the site works and the manufacturing run happen in parallel rather than in series. A single-module site is a smaller civil job than most industrial customers expect, and additional modules are added on the customer schedule.',
		category: 'Deployment'
	},
	{
		question: 'Do we have to become a nuclear operator?',
		answer:
			'No. Zettajoule owns the plant, runs it and staffs it with crews trained through our own Operations Academy. You buy heat, hydrogen or electricity under a long term energy contract and keep your own people on your own process.',
		category: 'Deployment'
	},
	{
		question: 'Can we start with one module and grow?',
		answer:
			'Yes. Deployment is either single-module or multi-module, and multi-module blocks are staged. A block also lets one module come off for maintenance while the others carry base load, which is how sites that cannot stop are served.',
		category: 'Deployment'
	}
];

async function upsert(client, sql, params) {
	await client.query(sql, params);
}

export async function migrateAndSeed() {
	const client = await pool.connect();
	try {
		await client.query(SCHEMA_SQL);
		await client.query('begin');

		const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
		for (const [email, name] of [
			['visitor@example.com', 'Ada Moreau'],
			['visitor2@example.com', 'Ken Adeyemi']
		]) {
			await upsert(
				client,
				`insert into accounts (email, password_hash, display_name) values ($1,$2,$3)
				 on conflict (email) do update set display_name = excluded.display_name`,
				[email, hash, name]
			);
		}

		for (const s of SOLUTIONS) {
			await upsert(
				client,
				`insert into solutions (slug, industry, title, summary, detail, output_kind, temperature_band, deployment, module_count)
				 values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
				 on conflict (slug) do update set industry=excluded.industry, title=excluded.title,
				   summary=excluded.summary, detail=excluded.detail, output_kind=excluded.output_kind,
				   temperature_band=excluded.temperature_band, deployment=excluded.deployment,
				   module_count=excluded.module_count`,
				[s.slug, s.industry, s.title, s.summary, s.detail, s.output_kind, s.temperature_band, s.deployment, s.module_count]
			);
		}

		for (const d of DOCUMENTS) {
			await upsert(
				client,
				`insert into documents (slug, title, category, published_at) values ($1,$2,$3,$4)
				 on conflict (slug) do update set title=excluded.title, category=excluded.category, published_at=excluded.published_at`,
				[d.slug, d.title, d.category, d.published_at]
			);
		}

		for (const j of JOBS) {
			await upsert(
				client,
				`insert into jobs (slug, title, location, team, description) values ($1,$2,$3,$4,$5)
				 on conflict (slug) do update set title=excluded.title, location=excluded.location,
				   team=excluded.team, description=excluded.description`,
				[j.slug, j.title, j.location, j.team, j.description]
			);
		}

		for (const s of STORIES) {
			await upsert(
				client,
				`insert into stories (slug, title, outlet, published_at, featured, body) values ($1,$2,$3,$4,$5,$6)
				 on conflict (slug) do update set title=excluded.title, outlet=excluded.outlet,
				   published_at=excluded.published_at, featured=excluded.featured, body=excluded.body`,
				[s.slug, s.title, s.outlet, s.published_at, s.featured, s.body]
			);
		}

		for (const t of TEAM) {
			await upsert(
				client,
				`insert into team_members (slug, name, role_title, bio, profile_url, sort_order) values ($1,$2,$3,$4,$5,$6)
				 on conflict (slug) do update set name=excluded.name, role_title=excluded.role_title,
				   bio=excluded.bio, profile_url=excluded.profile_url, sort_order=excluded.sort_order`,
				[t.slug, t.name, t.role_title, t.bio, t.profile_url, t.sort_order]
			);
		}

		for (const o of OFFICES) {
			await upsert(
				client,
				`insert into offices (city, country, role_label) values ($1,$2,$3)
				 on conflict (city) do update set country=excluded.country, role_label=excluded.role_label`,
				[o.city, o.country, o.role_label]
			);
		}

		for (const f of FAQS) {
			await upsert(
				client,
				`insert into faqs (question, answer, category) values ($1,$2,$3)
				 on conflict (question) do update set answer=excluded.answer, category=excluded.category`,
				[f.question, f.answer, f.category]
			);
		}

		const ada = (await client.query('select id from accounts where email=$1', ['visitor@example.com'])).rows[0];
		const ken = (await client.query('select id from accounts where email=$1', ['visitor2@example.com'])).rows[0];

		const solIds = {};
		for (const row of (await client.query('select id, slug from solutions')).rows) solIds[row.slug] = row.id;

		for (const [accId, slug] of [
			[ada.id, 'steel'],
			[ada.id, 'data-centres'],
			[ken.id, 'mining']
		]) {
			await upsert(
				client,
				`insert into saved_solutions (account_id, solution_id) values ($1,$2)
				 on conflict (account_id, solution_id) where account_id is not null do nothing`,
				[accId, solIds[slug]]
			);
		}

		await upsert(
			client,
			`insert into saved_searches (account_id, name, query, industry, output_kind, temperature_band, deployment)
			 values ($1,$2,$3,$4,$5,$6,$7)
			 on conflict (account_id, name) do update set query=excluded.query, industry=excluded.industry,
			   output_kind=excluded.output_kind, temperature_band=excluded.temperature_band, deployment=excluded.deployment`,
			[ada.id, 'Hydrogen sites', null, null, 'hydrogen', null, null]
		);

		await upsert(
			client,
			`insert into enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
			 values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
			 on conflict (reference) do nothing`,
			[
				'ENQ-7K2M9QD4',
				ada.id,
				'Ada Moreau',
				'visitor@example.com',
				'+31',
				'610 555 019',
				'Investor relations',
				'We are assembling a strategic round and would like the module economics behind the four module block.',
				'answered'
			]
		);

		await upsert(
			client,
			`insert into enquiries (reference, account_id, name, email, phone_country, phone, topic, message, status)
			 values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
			 on conflict (reference) do nothing`,
			[
				'ENQ-5R8X1CJ2',
				ken.id,
				'Ken Adeyemi',
				'visitor2@example.com',
				'+1',
				'312 555 0184',
				'Careers',
				'Interested in the Operations Academy route from a marine engineering background.',
				'received'
			]
		);

		await upsert(
			client,
			`insert into access_requests (reference, account_id, organisation, role_title, status)
			 values ($1,$2,$3,$4,$5)
			 on conflict (account_id) do update set reference=excluded.reference, organisation=excluded.organisation,
			   role_title=excluded.role_title, status=excluded.status`,
			['IAR-4H7N2PQ8', ada.id, 'Meridian Capital Partners', 'Managing Partner', 'approved']
		);

		await upsert(
			client,
			`insert into access_requests (reference, account_id, organisation, role_title, status)
			 values ($1,$2,$3,$4,$5)
			 on conflict (account_id) do update set reference=excluded.reference, organisation=excluded.organisation,
			   role_title=excluded.role_title, status=excluded.status`,
			['IAR-9T3V6BLM', ken.id, 'Northline Industrial', 'Head of Strategy', 'pending']
		);

		await client.query('commit');
	} catch (err) {
		await client.query('rollback').catch(() => {});
		throw err;
	} finally {
		client.release();
	}
}
