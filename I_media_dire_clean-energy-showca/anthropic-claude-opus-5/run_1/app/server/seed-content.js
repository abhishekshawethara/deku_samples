export const SOLUTIONS = [
	{
		slug: 'oil-and-gas',
		industry: 'Oil and Gas',
		title: 'Oil and Gas',
		summary:
			'Process heat for refining and upgrading, replacing fired heaters burning their own product.',
		detail:
			'A refinery runs on heat. Crude units, hydrotreaters and reformers all take their duty from fired heaters that burn gas the site could otherwise sell, and every one of them carries a stack. Four modules deliver 1000 MW thermal into the existing steam and hot oil headers at 250 to 550 C, so the fired heaters fall back to a start-up role. The reactor sits behind the fence line, we own it, we run it, and the refinery buys the heat. The carbon that leaves the site falls with the flue gas that stops leaving it, and the gas that used to feed the heaters becomes product again.',
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
			'High-grade heat and power together for crackers, reformers and the steam network around them.',
		detail:
			'Chemical sites take heat and electricity in the same breath, and the ratio moves with the plant. Three modules at 550 to 750 C carry the steam network and the site power at once, which is what a cracker complex actually asks for. Helium leaving the reactor at 750 C raises steam at pressures a water-cooled plant cannot reach, so the reactor sits upstream of the process rather than merely beside it. Because the modules are separate, an outage on one is a step down in supply rather than a stop, and the site keeps making product.',
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
			'Hydrogen at scale for heavy road, shipping and aviation fuel, made from heat rather than from gas.',
		detail:
			'Heavy transport does not electrify on a battery. It runs on a molecule, and that molecule has to be made somewhere. Six modules feeding high-temperature electrolysis at 550 to 750 C make hydrogen at an efficiency no cold electrolyser reaches, because the heat does work the electricity would otherwise have to do. The output feeds bunkering for shipping, a synthetic fuel plant for aviation, or a truck corridor directly. The plant runs at its rating around the clock, so the hydrogen has a cost the buyer can sign a decade of offtake against.',
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
			'Hydrogen for direct reduction, taking the coke oven out of the ironmaking route entirely.',
		detail:
			'Direct reduced iron made with hydrogen instead of coke is the one route to steel that ends with water at the stack. It needs hydrogen in quantities a grid connection struggles to supply, continuously, next to the plant. Eight modules at 550 to 750 C run high-temperature electrolysis at the works, feeding the shaft furnace and carrying the electric arc furnace behind it. The heat and the power come from the same object, we own and operate it, and the mill buys tonnes of hydrogen and megawatt hours rather than a reactor.',
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
			'Firm off-grid electricity for remote pits and processing, displacing a diesel farm.',
		detail:
			'A remote mine burns diesel it trucks in, and the fuel convoy is both the cost and the risk. One module gives 100 MW electrical on site, firm, without a fuel road. It carries the haul fleet as it electrifies, the mill, the pumps and the camp, and the low-grade heat that comes with it dries concentrate. Single module deployment matches a mine life: the module arrives, runs, and leaves at the end without a stranded grid connection behind it.',
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
			'Firm, carbon-free electricity behind the meter, sized to a campus and available in years not decades.',
		detail:
			'A data centre campus wants a large, firm, carbon-free block of power on a schedule the grid queue cannot promise. Two modules deliver 200 MW electrical behind the meter, running at rating every hour of the year, which is what a load with no daily shape actually needs. The waste heat leaves at a temperature district heating can use, so the campus exports warmth instead of rejecting it. We own and operate the plant; the operator signs a power agreement and keeps its hands on the racks.',
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
			'District heat and local power for a town or an island network from a single module.',
		detail:
			'A town on a district heating network and an island on imported fuel have the same problem in different weather: heat and power together, reliably, without a stack in the middle of it. One module carries a district network and its local electricity at once, with the heat taken at up to 250 C into the existing flow and return. The plant is small, quiet and walled, and because we staff and run it the community buys energy on a tariff rather than taking on a nuclear operation.',
		output_kind: 'heat-and-power',
		temperature_band: 'up to 250 C',
		deployment: 'single-module',
		module_count: 1
	},
	{
		slug: 'desalination',
		industry: 'Desalination',
		title: 'Desalination',
		summary: 'Thermal desalination at scale, with the heat and the pumping power from one plant.',
		detail:
			'Multi-effect distillation wants steady mid-grade heat, and reverse osmosis wants steady electricity; most coastal schemes want both. Two modules supply 250 to 550 C heat into the effects and the power for the high-pressure pumps, so a scheme can be built around whichever process the seawater and the site favour. Water output holds flat through the year because the heat source does not depend on the weather, and the plant sits on the coast where the water is needed rather than at the end of a long transmission line.',
		output_kind: 'heat',
		temperature_band: '250 to 550 C',
		deployment: 'single-module',
		module_count: 2
	}
];

export const DOCUMENTS = [
	{
		slug: 'investor-deck-2026',
		title: 'Investor Deck 2026',
		category: 'Financials',
		published_at: '2026-08-01',
		summary:
			'The full case: market, model, unit economics and the raise, as presented to the board in August 2026.'
	},
	{
		slug: 'technology-dossier',
		title: 'Technology Dossier',
		category: 'Technology',
		published_at: '2026-06-15',
		summary:
			'Fuel, moderator, coolant and the operating envelope, with the test reactor data the design is anchored to.'
	},
	{
		slug: 'licensing-roadmap',
		title: 'Licensing Roadmap',
		category: 'Regulatory',
		published_at: '2026-04-22',
		summary:
			'Every step from pre-application through construction consent, with dates and the evidence each one takes.'
	}
];

export const JOBS = [
	{
		slug: 'reactor-systems-engineer',
		title: 'Reactor Systems Engineer',
		location: 'Rotterdam',
		team: 'Engineering',
		description:
			'Own a system of the module end to end, from the helium circuit through the core internals to the interface with the customer process. You will size it, defend it in review, and stay with it through manufacture and commissioning. We are looking for somebody who has taken a thermal system from a sketch to something that ran, and who can write down clearly why it works.'
	},
	{
		slug: 'licensing-lead',
		title: 'Licensing Lead',
		location: 'Chicago',
		team: 'Regulatory',
		description:
			'Carry the licensing case in North America: the pre-application engagement, the safety analysis narrative, and the evidence chain back to the test reactor that has been running since the late 1990s. You will work between the regulator and the engineers and be trusted by both.'
	},
	{
		slug: 'operations-trainer',
		title: 'Operations Trainer',
		location: 'Rotterdam',
		team: 'Operations Academy',
		description:
			'Build the programme that qualifies the crews who run our modules on customer sites. You will write the courses, run the simulator sessions and sign people off. Experience on a licensed plant matters more here than a teaching qualification, though both are welcome.'
	}
];

export const STORIES = [
	{
		slug: 'first-module-order',
		title: 'First module order signed',
		outlet: 'Company news',
		published_at: '2026-08-18',
		featured: true,
		body: 'The first firm order for a Zettajoule module has been signed with an industrial customer in northwest Europe, covering a single unit delivering process heat into an existing steam header, with an option over three further modules on the same site.\n\nThe agreement is an energy supply agreement rather than a reactor sale. Zettajoule owns the module, staffs it with crews qualified through the Operations Academy, and is paid for delivered heat against an availability guarantee. The customer keeps its process and takes no nuclear licence of its own.\n\nSite works begin once the construction consent completes its final step. The module itself is built in the factory in parallel, which is the point of building in modules: the long pole is consent, not steel.'
	},
	{
		slug: 'helium-loop-milestone',
		title: 'Helium loop completes a 1000 hour run',
		outlet: 'Company news',
		published_at: '2026-07-02',
		featured: false,
		body: 'The full-scale helium test loop has completed a continuous 1000 hour run at outlet conditions, holding 750 degrees Celsius at the outlet across the whole period with no unplanned interruption.\n\nThe run exercised the circulator, the heat exchanger and the instrumentation together, at temperature, for longer than any previous campaign. Post-run inspection found wear within the predicted band, and the measured data has been fed back into the digital twin that shadows every module.\n\nThe loop now moves to a cyclic campaign, ramping between part load and full load to characterise the components under the duty an industrial customer will actually impose.'
	},
	{
		slug: 'steel-partnership',
		title: 'Steel partnership targets the hydrogen route',
		outlet: 'Industry Week',
		published_at: '2026-05-14',
		featured: false,
		body: 'A joint development agreement with a European steelmaker will study eight modules supplying high-temperature electrolysis alongside a direct reduction plant, replacing the coke-based ironmaking route on the site.\n\nThe study covers the hydrogen balance, the electrical load of the arc furnace and the phasing that lets the works keep producing while the change is made. High-temperature electrolysis is central to the economics: taking part of the energy as heat rather than electricity lifts the efficiency of the hydrogen plant enough to change the cost of the steel.\n\nA decision to proceed to front-end engineering is expected once the study reports.'
	},
	{
		slug: 'licensing-step-cleared',
		title: 'Licensing step cleared',
		outlet: 'Energy Monitor',
		published_at: '2026-03-09',
		featured: false,
		body: 'The regulator has closed out the first formal step of the pre-application process without carry-over actions, accepting the safety case topic list and the schedule attached to it.\n\nThe step matters more than its size suggests. Because the design is a modernised version of a reactor that has been operating as a test unit since the late 1990s, much of the evidence offered is measured rather than modelled, and the regulator has accepted that operating record as the anchor for the thermal and fuel performance claims.\n\nThe next step covers the fuel qualification package and opens in the autumn.'
	},
	{
		slug: 'academy-first-cohort',
		title: 'Operations Academy takes its first cohort',
		outlet: 'Company news',
		published_at: '2026-02-11',
		featured: false,
		body: 'Sixteen trainees have started the first full programme at the Operations Academy in Rotterdam, the arm of the company that qualifies the crews for the modules we own and run.\n\nThe cohort mixes people from conventional power, from process industry and from the navy, and runs eighteen months of classroom, simulator and placement work before sign-off. Because Zettajoule staffs its own plants, the Academy is not a side activity: the rate at which it qualifies crews sets the rate at which modules can be deployed.\n\nApplications for the second cohort open later in the year.'
	},
	{
		slug: 'desalination-study',
		title: 'Desalination study opens in the Gulf',
		outlet: 'Water Report',
		published_at: '2026-01-20',
		featured: false,
		body: 'A feasibility study has opened with a Gulf water authority covering two modules supplying a coastal desalination scheme, taking mid-grade heat into multi-effect distillation and electricity for the high-pressure pumps of a reverse osmosis train.\n\nThe study will settle the split between the two processes for the site seawater, and size the storage that lets water output stay flat while demand moves through the year.\n\nA reactor sited on the coast avoids the transmission that a remote generator would need, and the study includes the marine and siting work that goes with that.'
	},
	{
		slug: 'helium-supply-signed',
		title: 'Helium supply agreement signed',
		outlet: 'Company news',
		published_at: '2025-11-05',
		featured: false,
		body: 'A long-term helium supply agreement has been signed covering the test loop, the first commercial modules and the inventory held against make-up.\n\nHelium is the coolant because it is chemically inert: it does not react with the fuel, the graphite or the pressure boundary at any temperature the reactor reaches, and it carries no activation product of consequence. That inertness is a large part of why the plant can run at 750 degrees Celsius at the outlet.\n\nThe agreement secures supply through the first deployments and includes an option scaled to the module pipeline behind them.'
	}
];

export const TEAM = [
	{
		slug: 'mira-halvorsen',
		name: 'Mira Halvorsen',
		role_title: 'Chief Executive',
		bio: 'Mira has spent twenty years turning energy projects into operating assets, most recently leading the development arm of a European independent power producer through six financial closes. She joined Zettajoule because selling energy rather than reactors is the change that makes advanced nuclear buildable, and because the design was already running as a test unit rather than sitting in a folder. She chairs the investment committee and carries the relationships with our first industrial customers. The name is a stand-in and the portrait is drawn from code.',
		profile_url: 'https://example.com/team/mira-halvorsen'
	},
	{
		slug: 'tobias-ruiz',
		name: 'Tobias Ruiz',
		role_title: 'Chief Technology Officer',
		bio: 'Tobias led high-temperature materials work on gas-cooled systems for a national laboratory before moving into industry, and has published on coated particle fuel behaviour above 1600 degrees Celsius. He owns the module design, the helium loop campaign and the digital twin that shadows every unit. His rule for the engineering group is that any number in the safety case should trace to something measured on a machine that ran. The name is a stand-in and the portrait is drawn from code.',
		profile_url: 'https://example.com/team/tobias-ruiz'
	},
	{
		slug: 'anneke-vos',
		name: 'Anneke Vos',
		role_title: 'Head of Licensing',
		bio: 'Anneke spent eleven years inside a nuclear regulator, latterly assessing new reactor submissions, and now sits on the other side of the table with the same standards. She built our pre-application strategy around the operating record of the test reactor, on the argument that measured evidence moves faster than modelled evidence. She leads the licensing teams in Rotterdam and Chicago. The name is a stand-in and the portrait is drawn from code.',
		profile_url: 'https://example.com/team/anneke-vos'
	},
	{
		slug: 'daniel-okoye',
		name: 'Daniel Okoye',
		role_title: 'Head of Operations Academy',
		bio: 'Daniel qualified as a reactor operator, moved into training, and has run simulator programmes for two fleets across three countries. Because Zettajoule owns and staffs the plants it builds, he treats the Academy as part of the supply chain: crews are as much a lead-time item as pressure vessels. He designed the eighteen month programme and signs off every operator personally. The name is a stand-in and the portrait is drawn from code.',
		profile_url: 'https://example.com/team/daniel-okoye'
	}
];

export const OFFICES = [
	{ city: 'Rotterdam', country: 'Netherlands', role_label: 'Headquarters' },
	{ city: 'Chicago', country: 'United States', role_label: 'Licensing' },
	{ city: 'Tokyo', country: 'Japan', role_label: 'Engineering' }
];

export const FAQS = [
	{
		question: 'What kind of reactor is this?',
		answer:
			'A high-temperature gas-cooled reactor. Each module delivers 250 MW thermal and sends helium out of the core at 750 degrees Celsius at the outlet, which is far hotter than a water-cooled plant can reach and is what lets the energy do industrial work rather than only make electricity.',
		category: 'Technology'
	},
	{
		question: 'What is the fuel and why does it hold together?',
		answer:
			'Tiny uranium kernels are wrapped in layers of carbon and silicon carbide, making coated particles a fraction of a millimetre across. Each particle is its own pressure vessel and holds its fission products in at temperatures beyond anything the plant can reach in an accident, so the fuel form itself is a large part of the safety case.',
		category: 'Technology'
	},
	{
		question: 'Why helium rather than water or sodium?',
		answer:
			'Helium is chemically inert. It does not react with the fuel, the graphite moderator or the pressure boundary at any temperature the reactor sees, it does not burn, and it does not change phase. That is what allows a 750 degree outlet without the chemistry problems other coolants bring with them.',
		category: 'Technology'
	},
	{
		question: 'Do we have to buy and licence a reactor?',
		answer:
			'No. Zettajoule owns the plant, operates it and staffs it with crews qualified through our own Operations Academy. You buy delivered heat, hydrogen or electricity under a supply agreement, and the nuclear licence, the crews and the decommissioning liability stay with us.',
		category: 'Deployment'
	},
	{
		question: 'How long does deployment take and how does it scale?',
		answer:
			'Modules are built in a factory and assembled on site, so the build is short and repeatable and the schedule is driven by consent rather than construction. A site can start with one module and add more as demand grows; multi-module sites step their supply down for maintenance rather than stopping.',
		category: 'Deployment'
	},
	{
		question: 'How much land, and what about the heat we cannot use?',
		answer:
			'A single module sits on a compact walled site that fits inside an existing industrial fence line, close to the process it serves so the heat travels a short distance. Heat you do not take is available at up to 250 C for district networks or feedwater, and the calculator on this site will size the modules and the energy for your own need.',
		category: 'Deployment'
	}
];

export const SITE_COPY = [
	{
		route_key: 'home',
		block_key: 'hero',
		heading: 'Powering the World',
		body: 'We build small high-temperature reactor modules, own them, run them, and sell you the energy.',
		sort_order: 0
	},
	{
		route_key: 'home',
		block_key: 'name',
		heading: 'Why Zettajoule',
		body: 'A zettajoule is a billion trillion joules. The world uses somewhere north of six hundred of them a year today, and the demand curve for industrial heat, hydrogen and firm electricity bends upward from here, not down. We took the unit of the problem as the name of the company because the number is the point: this is a quantity of energy that only a dense, always-on, carbon-free source can serve.',
		sort_order: 1
	},
	{
		route_key: 'home',
		block_key: 'industries',
		heading: 'Eight industries, one object',
		body: 'The same module serves a refinery, a steelworks, a mine and a town, because what changes between them is the temperature it is taken at and how many modules stand on the site.',
		sort_order: 2
	},
	{
		route_key: 'home',
		block_key: 'technology',
		heading: 'A reactor that runs hot',
		body: 'Coated particle fuel in a graphite core, cooled by helium that leaves at 750 degrees Celsius. It is a modernised version of a machine that has been running as a test reactor since the late 1990s, not a paper concept.',
		sort_order: 3
	},
	{
		route_key: 'home',
		block_key: 'heat',
		heading: 'Nothing else runs this hot',
		body: 'A water-cooled reactor tops out around 300 degrees Celsius, and most industrial heat lives above it. At 750 degrees Celsius at the outlet this module reaches the chemistry, the steel and the hydrogen that the rest of the fleet simply cannot touch. That single number is the whole argument.',
		sort_order: 4
	},
	{
		route_key: 'company',
		block_key: 'lede',
		heading: 'clean heat and electricity to power a world of industrial applications',
		body: 'Zettajoule exists to put carbon-free energy where industry actually consumes it: as heat, at temperature, next to the process, all day and every day.',
		sort_order: 0
	},
	{
		route_key: 'company',
		block_key: 'vision',
		heading: 'The vision',
		body: 'A world where the heat that makes steel, fuel, chemicals and clean water carries no carbon with it, and where the plant that provides it is small enough to stand inside the fence line of the site it serves. Electricity was the easy part of the energy transition. Heat is the rest of it.',
		sort_order: 1
	},
	{
		route_key: 'company',
		block_key: 'mission',
		heading: 'The mission',
		body: 'To provide clean, reliable heat and power to industry as a service. We deliver the energy under a long-term agreement, at an availability we guarantee, at a price a customer can plan a decade around. The module is our problem; the product is the customer\u2019s.',
		sort_order: 2
	},
	{
		route_key: 'company',
		block_key: 'name',
		heading: 'The name',
		body: 'The name is built from the units of the energy the world will need. A joule is the smallest honest unit of work; a zettajoule is a billion trillion of them, and global demand is counted in hundreds of zettajoules a year. Naming ourselves after the unit keeps the scale of the task in the room at every meeting.',
		sort_order: 3
	},
	{
		route_key: 'company',
		block_key: 'model',
		heading: 'We do not only build the reactor',
		body: 'We own it, we run it and we staff it. Crews come through our own Operations Academy, the nuclear licence sits with us, and the decommissioning liability sits with us. The customer signs for energy delivered and keeps its attention on making its product.',
		sort_order: 4
	},
	{
		route_key: 'technology',
		block_key: 'lede',
		heading: 'A modernised high-temperature gas-cooled reactor',
		body: 'Coated particle fuel, a graphite core and helium coolant, in a module rated at 250 MW thermal with an outlet temperature of 750 degrees Celsius. Every element of it has run before.',
		sort_order: 0
	},
	{
		route_key: 'technology',
		block_key: 'fuel',
		heading: 'The fuel',
		body: 'Uranium kernels a fraction of a millimetre across are wrapped in layers of pyrolytic carbon and silicon carbide. Each coated particle is a pressure vessel in its own right, holding its fission products inside at temperatures well beyond anything the plant can reach even with no cooling at all. Thousands of them are pressed into a fuel element, so the safety case begins at the scale of a grain of sand.',
		sort_order: 1
	},
	{
		route_key: 'technology',
		block_key: 'graphite',
		heading: 'The graphite',
		body: 'Graphite surrounds the fuel and moderates the neutrons. It also carries an enormous thermal mass, which is why the core responds to an upset in hours rather than seconds: there is simply too much heat capacity in the block for the temperature to run away.',
		sort_order: 2
	},
	{
		route_key: 'technology',
		block_key: 'helium',
		heading: 'The helium',
		body: 'Helium cools the core and stays chemically calm around everything it touches. It does not burn, does not change phase, does not corrode the pressure boundary and does not react with the fuel or the graphite at any temperature the reactor reaches. That inertness is what buys the 750 degree outlet.',
		sort_order: 3
	},
	{
		route_key: 'technology',
		block_key: 'twin',
		heading: 'The digital twin',
		body: 'A living digital copy of each module runs alongside the real one, fed by its instrumentation. Divergence between the two is the earliest signal of a developing problem, which turns unplanned outages into planned ones and takes cost out of the operating life rather than out of the build.',
		sort_order: 4
	},
	{
		route_key: 'technology',
		block_key: 'safety',
		heading: 'The safety case',
		body: 'The design is anchored to a test reactor of this type that has been operating since the late 1990s. Its measured behaviour, including tests where cooling was deliberately removed at power, is the evidence base we take to a regulator. Measured evidence moves faster than modelled evidence.',
		sort_order: 5
	},
	{
		route_key: 'technology',
		block_key: 'modular',
		heading: 'Built in modules',
		body: 'Modules are manufactured in a factory and assembled on site, so a site can be quick to deploy and simple to scale: add a module when the load grows, take one down for maintenance without stopping the others.',
		sort_order: 6
	},
	{
		route_key: 'edge',
		block_key: 'lede',
		heading: 'Proven, hotter, modular, and sold as energy',
		body: 'Four things separate this from the rest of the advanced nuclear field, and the first one carries the others.',
		sort_order: 0
	},
	{
		route_key: 'edge',
		block_key: 'proven',
		heading: 'Not a paper concept',
		body: 'The design is a modernised version of a real reactor that already exists and has been running as a test unit since the late 1990s. Its fuel, its coolant and its core have accumulated operating hours. That makes the performance claims believable and the licensing route far shorter than it is for a machine that has never been built.',
		sort_order: 1
	},
	{
		route_key: 'edge',
		block_key: 'hotter',
		heading: 'It runs much hotter',
		body: 'Ordinary water-cooled reactors deliver heat at around 300 degrees Celsius. This one delivers 750. That gap is the difference between making electricity and making steel, hydrogen, synthetic fuel and chemicals, which is work water-cooled plants simply cannot do.',
		sort_order: 2
	},
	{
		route_key: 'edge',
		block_key: 'modular',
		heading: 'One module or several',
		body: 'A single module suits a mine, a town or a campus. Multi-module sites suit refineries, chemical complexes and steelworks, and step their output down for maintenance instead of stopping. The same factory-built unit serves both.',
		sort_order: 3
	},
	{
		route_key: 'edge',
		block_key: 'model',
		heading: 'You buy the energy, not the reactor',
		body: 'We own the plant, we operate it and we staff it. No nuclear licence, no crews to recruit, no decommissioning liability on the customer\u2019s balance sheet. The customer buys heat, hydrogen or electricity on a long-term agreement and nothing else changes.',
		sort_order: 4
	},
	{
		route_key: 'team',
		block_key: 'lede',
		heading: 'shaping the future of nuclear together',
		body: 'We are an international group of recognised experts in reactor engineering, licensing and industrial operations, drawn from regulators, national laboratories and operating fleets.',
		sort_order: 0
	},
	{
		route_key: 'investors',
		block_key: 'lede',
		heading: 'A proven machine, sold as a service, into the largest energy market there is',
		body: 'Industrial heat is roughly a quarter of final energy demand and almost none of it is clean today. The investable question is not whether that changes but which machine gets there first with a licence in hand.',
		sort_order: 0
	},
	{
		route_key: 'investors',
		block_key: 'market',
		heading: 'The size of the need',
		body: 'Global final energy demand runs to hundreds of zettajoules a year, and the industrial heat portion of it is both the largest and the least addressed. Every credible path to a decarbonised industry needs a dense, firm, high-temperature source, and there are very few of those.',
		sort_order: 1
	},
	{
		route_key: 'investors',
		block_key: 'model',
		heading: 'Why energy-as-a-service is the strong business',
		body: 'Selling reactors means long, lumpy, one-off revenue and a customer who must become a nuclear operator. Selling energy means recurring contracted revenue over decades against an asset we control, with the operating skill kept in-house and repeatable across every module we build.',
		sort_order: 2
	},
	{
		route_key: 'investors',
		block_key: 'compare',
		heading: 'Against the alternatives',
		body: 'Water-cooled small reactors cannot reach industrial temperatures. Molten salt and fast designs reach them but carry chemistry, materials and licensing risk that has never been retired at scale. Renewables plus storage cannot hold a firm high-temperature load. A modernised high-temperature gas-cooled reactor is the only option here with an operating record behind it.',
		sort_order: 3
	},
	{
		route_key: 'careers',
		block_key: 'lede',
		heading: "help us build what's next in nuclear energy",
		body: 'We do right by our partners, the planet and our employees, in that order on a good day and in every order on a hard one.',
		sort_order: 0
	},
	{
		route_key: 'careers',
		block_key: 'culture',
		heading: 'How we work',
		body: 'Small teams, written arguments, and a bias toward the number somebody measured. Engineering, licensing and operations sit in the same room because a design decision that cannot be licensed or crewed is not a design decision. We hire from regulators, from process industry and from operating fleets, and we expect people to disagree in the open.',
		sort_order: 1
	},
	{
		route_key: 'careers',
		block_key: 'academy',
		heading: 'The Operations Academy',
		body: 'Because we own and run our plants, we train the people who run them. The Academy takes operators through eighteen months of classroom, simulator and placement work before sign-off, and the rate it qualifies crews is one of the things that sets how fast we can deploy.',
		sort_order: 2
	},
	{
		route_key: 'contact',
		block_key: 'lede',
		heading: 'Get in touch',
		body: 'This form reaches the team directly. Use it for careers, investor and supplier enquiries, or anything technical about the modules and where they can stand.',
		sort_order: 0
	},
	{
		route_key: 'solutions',
		block_key: 'lede',
		heading: 'What can this power?',
		body: 'Eight industries, filtered by what they need out of the reactor, how hot they need it and how it would be deployed.',
		sort_order: 0
	},
	{
		route_key: 'calculator',
		block_key: 'lede',
		heading: 'Size your site',
		body: 'One module delivers 250 MW thermal, or 100 MW electrical at 40 percent conversion, and runs 8000 hours a year. Each GWh delivered avoids 450 tonnes of carbon.',
		sort_order: 0
	},
	{
		route_key: 'news',
		block_key: 'lede',
		heading: 'latest news',
		body: 'Browse company news, press coverage and media.',
		sort_order: 0
	},
	{
		route_key: 'faq',
		block_key: 'lede',
		heading: 'Common questions',
		body: 'The things people ask us first, about the machine and about putting one on a site.',
		sort_order: 0
	}
];

export const ROADMAP = [
	{
		year: '1998',
		title: 'Test reactor first criticality',
		body: 'The high-temperature gas-cooled test reactor this design modernises reaches first criticality and begins the operating record the safety case rests on.'
	},
	{
		year: '2024',
		title: 'Company founded',
		body: 'Zettajoule is formed in Rotterdam around a single decision: sell the energy, not the reactor.'
	},
	{
		year: '2026',
		title: 'Licensing step cleared',
		body: 'The first formal pre-application step closes with no carry-over actions, and the helium loop completes a 1000 hour run at 750 degrees Celsius.'
	},
	{
		year: '2027',
		title: 'Fuel qualification package',
		body: 'Coated particle fuel qualification is submitted, with irradiation and heat-up data from the test reactor programme.'
	},
	{
		year: '2029',
		title: 'Construction consent',
		body: 'Consent for the first commercial site completes, with factory manufacture of the module already under way in parallel.'
	},
	{
		year: '2031',
		title: 'First deployment',
		body: 'The first module delivers heat into a customer process under an energy supply agreement, owned, operated and staffed by Zettajoule.'
	}
];
