const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.tvO-p-Mh.js",app:"_app/immutable/entry/app.BCV3p5ax.js",imports:["_app/immutable/entry/start.tvO-p-Mh.js","_app/immutable/chunks/Bh7MOdNg.js","_app/immutable/chunks/DMoS_FMk.js","_app/immutable/chunks/OA8UcISh.js","_app/immutable/chunks/BSeb6kpB.js","_app/immutable/entry/app.BCV3p5ax.js","_app/immutable/chunks/DMoS_FMk.js","_app/immutable/chunks/D43MRvfz.js","_app/immutable/chunks/BSeb6kpB.js","_app/immutable/chunks/LR5ePjSA.js","_app/immutable/chunks/BIhcvOZk.js","_app/immutable/chunks/CS-Uh4U9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js-C7bT1Zz3.js')),
			__memo(() => import('./nodes/1.js-B7QmFQeE.js')),
			__memo(() => import('./nodes/2.js-BvXU43RY.js')),
			__memo(() => import('./nodes/3.js-SUXEWhJ7.js')),
			__memo(() => import('./nodes/4.js-I8ikGdn4.js')),
			__memo(() => import('./nodes/5.js-BafwZwYq.js')),
			__memo(() => import('./nodes/6.js-Cy7mUAGv.js')),
			__memo(() => import('./nodes/7.js-hxeezcb8.js')),
			__memo(() => import('./nodes/8.js-D3MaukWv.js')),
			__memo(() => import('./nodes/9.js-B-gieBkD.js')),
			__memo(() => import('./nodes/10.js-C4aKE_w4.js')),
			__memo(() => import('./nodes/11.js-BbtlvEtD.js')),
			__memo(() => import('./nodes/12.js-BGicrnW2.js')),
			__memo(() => import('./nodes/13.js-CmXmevqs.js')),
			__memo(() => import('./nodes/14.js-h0k6NSTt.js')),
			__memo(() => import('./nodes/15.js-YBs74e5g.js')),
			__memo(() => import('./nodes/16.js-BBqif-Ur.js')),
			__memo(() => import('./nodes/17.js-BQqBrVoZ.js')),
			__memo(() => import('./nodes/18.js-B7nHaPq_.js')),
			__memo(() => import('./nodes/19.js-C9qgKr0Z.js')),
			__memo(() => import('./nodes/20.js-cNfH9wTS.js'))
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
//# sourceMappingURL=manifest.js-I8dsY44I.js.map
