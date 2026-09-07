
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/account" | "/calculator" | "/careers" | "/company" | "/compare" | "/contact" | "/edge" | "/faq" | "/investors" | "/investors/room" | "/news" | "/news/[slug]" | "/signin" | "/signup" | "/solutions" | "/solutions/[slug]" | "/team" | "/technology";
		RouteParams(): {
			"/news/[slug]": { slug: string };
			"/solutions/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { slug?: string | undefined };
			"/account": Record<string, never>;
			"/calculator": Record<string, never>;
			"/careers": Record<string, never>;
			"/company": Record<string, never>;
			"/compare": Record<string, never>;
			"/contact": Record<string, never>;
			"/edge": Record<string, never>;
			"/faq": Record<string, never>;
			"/investors": Record<string, never>;
			"/investors/room": Record<string, never>;
			"/news": { slug?: string | undefined };
			"/news/[slug]": { slug: string };
			"/signin": Record<string, never>;
			"/signup": Record<string, never>;
			"/solutions": { slug?: string | undefined };
			"/solutions/[slug]": { slug: string };
			"/team": Record<string, never>;
			"/technology": Record<string, never>
		};
		Pathname(): "/" | "/account" | "/calculator" | "/careers" | "/company" | "/compare" | "/contact" | "/edge" | "/faq" | "/investors" | "/investors/room" | "/news" | `/news/${string}` & {} | "/signin" | "/signup" | "/solutions" | `/solutions/${string}` & {} | "/team" | "/technology";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}