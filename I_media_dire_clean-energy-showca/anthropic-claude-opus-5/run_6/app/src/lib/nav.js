export const MENU = [
	{ href: '/company', label: 'Company' },
	{ href: '/technology', label: 'Technology' },
	{ href: '/solutions', label: 'Solutions' },
	{ href: '/edge', label: 'Our Edge' },
	{ href: '/team', label: 'Our Team' },
	{ href: '/investors', label: 'Investors' },
	{ href: '/news', label: 'News' },
	{ href: '/careers', label: 'Careers' },
	{ href: '/contact', label: 'Contact' }
];

export const OUTPUTS = [
	{ kind: 'heat', label: 'Heat' },
	{ kind: 'heat-and-power', label: 'Heat and power' },
	{ kind: 'hydrogen', label: 'Hydrogen' },
	{ kind: 'electricity', label: 'Electricity' }
];

export const KEY_FACTS = [
	'High-temperature gas-cooled reactor',
	'250 MW thermal a module',
	'750 degrees Celsius at the outlet'
];

export const TEMP_BANDS = ['up to 250 C', '250 to 550 C', '550 to 750 C'];
export const DEPLOYMENTS = ['single-module', 'multi-module'];
export const TOPICS = ['Technology', 'Solutions', 'Investor relations', 'Careers', 'Suppliers'];

export const PHONE_COUNTRIES = [
	{ code: '+31', label: 'Netherlands (+31)' },
	{ code: '+1', label: 'United States (+1)' },
	{ code: '+44', label: 'United Kingdom (+44)' },
	{ code: '+81', label: 'Japan (+81)' },
	{ code: '+49', label: 'Germany (+49)' },
	{ code: '+33', label: 'France (+33)' },
	{ code: '+61', label: 'Australia (+61)' },
	{ code: '+971', label: 'United Arab Emirates (+971)' }
];

export function labelForOutput(kind) {
	return OUTPUTS.find((o) => o.kind === kind)?.label || kind;
}
