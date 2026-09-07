const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.Cy2Touxj.js",app:"_app/immutable/entry/app.BBr4X0ZN.js",imports:["_app/immutable/entry/start.Cy2Touxj.js","_app/immutable/chunks/D1pUFZNq.js","_app/immutable/chunks/hcWsK2WI.js","_app/immutable/chunks/B8Z5lQpV.js","_app/immutable/chunks/DVpC-KkP.js","_app/immutable/entry/app.BBr4X0ZN.js","_app/immutable/chunks/hcWsK2WI.js","_app/immutable/chunks/BeLTFk-v.js","_app/immutable/chunks/DVpC-KkP.js","_app/immutable/chunks/DC54b-D4.js","_app/immutable/chunks/CSgxPckW.js","_app/immutable/chunks/DJ1_xXRv.js","_app/immutable/chunks/x9unFnoE.js","_app/immutable/chunks/B8Z5lQpV.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js-2t8g2IxH.js')),
			__memo(() => import('./nodes/1.js-CfhDUKEL.js')),
			__memo(() => import('./nodes/2.js-m4h9C-nr.js')),
			__memo(() => import('./nodes/3.js-AyyyZeB-.js')),
			__memo(() => import('./nodes/4.js-BJAvnSRs.js')),
			__memo(() => import('./nodes/5.js-DbONbsKY.js')),
			__memo(() => import('./nodes/6.js-DnX9-p0s.js')),
			__memo(() => import('./nodes/7.js-BMrgDXHF.js')),
			__memo(() => import('./nodes/8.js-6GzPxmVD.js')),
			__memo(() => import('./nodes/9.js-B0bHdwn_.js')),
			__memo(() => import('./nodes/10.js-CWvOGbMC.js')),
			__memo(() => import('./nodes/11.js-DQUPEOeV.js')),
			__memo(() => import('./nodes/12.js-DaEUWK6G.js')),
			__memo(() => import('./nodes/13.js-CzdwBwHw.js')),
			__memo(() => import('./nodes/14.js-DB8a4VxJ.js')),
			__memo(() => import('./nodes/15.js-DGnpX8yO.js')),
			__memo(() => import('./nodes/16.js-DQf_tUCa.js')),
			__memo(() => import('./nodes/17.js-fflLcWZy.js')),
			__memo(() => import('./nodes/18.js-DpHTeR8V.js')),
			__memo(() => import('./nodes/19.js-sIKzFbmj.js')),
			__memo(() => import('./nodes/20.js-D5dimUB2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/account",
				pattern: /^\/account\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/calculator",
				pattern: /^\/calculator\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/careers",
				pattern: /^\/careers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/company",
				pattern: /^\/company\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/compare",
				pattern: /^\/compare\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/contact",
				pattern: /^\/contact\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/edge",
				pattern: /^\/edge\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/faq",
				pattern: /^\/faq\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/investors",
				pattern: /^\/investors\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/investors/room",
				pattern: /^\/investors\/room\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/news",
				pattern: /^\/news\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/news/[slug]",
				pattern: /^\/news\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/signin",
				pattern: /^\/signin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/signup",
				pattern: /^\/signup\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/solutions",
				pattern: /^\/solutions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/solutions/[slug]",
				pattern: /^\/solutions\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/team",
				pattern: /^\/team\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/technology",
				pattern: /^\/technology\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export { manifest as m };
//# sourceMappingURL=manifest.js-Qz6fcpVO.js.map
