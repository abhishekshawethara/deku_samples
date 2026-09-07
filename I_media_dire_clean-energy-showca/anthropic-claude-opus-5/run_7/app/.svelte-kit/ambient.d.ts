
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SVELTEKIT_FORK: string;
	export const NODE_ENV: string;
	export const PYGAME_HIDE_SUPPORT_PROMPT: string;
	export const LLM_MODEL: string;
	export const LOCAL_RUNTIME_MODE: string;
	export const npm_command: string;
	export const PYTHONPATH: string;
	export const npm_execpath: string;
	export const npm_config_globalconfig: string;
	export const SMTP_PASS: string;
	export const PROMPT_COMMAND: string;
	export const SMTP_USER: string;
	export const SANDBOX_ENABLE_AUTO_LINT: string;
	export const SKIP_DEPENDENCY_CHECK: string;
	export const npm_lifecycle_event: string;
	export const FILE_STORE_PATH: string;
	export const PS2: string;
	export const TMUX: string;
	export const OPENHANDS_REPO_PATH: string;
	export const SMTP_HOST: string;
	export const TMUX_PANE: string;
	export const SAVE_TRAJECTORY_PATH: string;
	export const USER: string;
	export const npm_config_local_prefix: string;
	export const npm_config_userconfig: string;
	export const LLM_REASONING_EFFORT: string;
	export const npm_config_npm_version: string;
	export const npm_package_version: string;
	export const GPG_KEY: string;
	export const LLM_LOG_COMPLETIONS_FOLDER: string;
	export const PYTHON_VERSION: string;
	export const OR_SITE_URL: string;
	export const TERM: string;
	export const COLOR: string;
	export const FILE_STORE: string;
	export const SANDBOX_VOLUMES: string;
	export const LLM_API_KEY: string;
	export const npm_config_global_prefix: string;
	export const TIKTOKEN_CACHE_DIR: string;
	export const DEBIAN_FRONTEND: string;
	export const HOME: string;
	export const APP_PUBLIC_URL: string;
	export const DB_URL: string;
	export const ENABLE_AUTO_LINT: string;
	export const PYTHON_SHA256: string;
	export const AGENT_ENABLE_PROMPT_EXTENSIONS: string;
	export const _: string;
	export const DATABASE_URL: string;
	export const npm_config_prefix: string;
	export const npm_config_noproxy: string;
	export const HOSTNAME: string;
	export const SHLVL: string;
	export const PIP_DISABLE_PIP_VERSION_CHECK: string;
	export const npm_node_execpath: string;
	export const SMTP_PORT: string;
	export const npm_package_json: string;
	export const PS1: string;
	export const ENABLE_BROWSER: string;
	export const OLDPWD: string;
	export const NODE_MAJOR: string;
	export const npm_config_user_agent: string;
	export const RUNTIME: string;
	export const PWD: string;
	export const APP_PUBLIC_PORT: string;
	export const RUN_AS_OPENHANDS: string;
	export const LLM_LOG_COMPLETIONS: string;
	export const TERM_PROGRAM_VERSION: string;
	export const OR_APP_NAME: string;
	export const EDITOR: string;
	export const AGENT_ENABLE_BROWSING: string;
	export const PYTHONDONTWRITEBYTECODE: string;
	export const npm_config_init_module: string;
	export const LLM_BASE_URL: string;
	export const PYTHONUNBUFFERED: string;
	export const npm_config_cache: string;
	export const PATH: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const INIT_CWD: string;
	export const SU_TO_USER: string;
	export const LANG: string;
	export const LLM_NATIVE_TOOL_CALLING: string;
	export const VSCODE_PORT: string;
	export const TERM_PROGRAM: string;
	export const npm_lifecycle_script: string;
	export const npm_config_node_gyp: string;
	export const SHELL: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SVELTEKIT_FORK: string;
		NODE_ENV: string;
		PYGAME_HIDE_SUPPORT_PROMPT: string;
		LLM_MODEL: string;
		LOCAL_RUNTIME_MODE: string;
		npm_command: string;
		PYTHONPATH: string;
		npm_execpath: string;
		npm_config_globalconfig: string;
		SMTP_PASS: string;
		PROMPT_COMMAND: string;
		SMTP_USER: string;
		SANDBOX_ENABLE_AUTO_LINT: string;
		SKIP_DEPENDENCY_CHECK: string;
		npm_lifecycle_event: string;
		FILE_STORE_PATH: string;
		PS2: string;
		TMUX: string;
		OPENHANDS_REPO_PATH: string;
		SMTP_HOST: string;
		TMUX_PANE: string;
		SAVE_TRAJECTORY_PATH: string;
		USER: string;
		npm_config_local_prefix: string;
		npm_config_userconfig: string;
		LLM_REASONING_EFFORT: string;
		npm_config_npm_version: string;
		npm_package_version: string;
		GPG_KEY: string;
		LLM_LOG_COMPLETIONS_FOLDER: string;
		PYTHON_VERSION: string;
		OR_SITE_URL: string;
		TERM: string;
		COLOR: string;
		FILE_STORE: string;
		SANDBOX_VOLUMES: string;
		LLM_API_KEY: string;
		npm_config_global_prefix: string;
		TIKTOKEN_CACHE_DIR: string;
		DEBIAN_FRONTEND: string;
		HOME: string;
		APP_PUBLIC_URL: string;
		DB_URL: string;
		ENABLE_AUTO_LINT: string;
		PYTHON_SHA256: string;
		AGENT_ENABLE_PROMPT_EXTENSIONS: string;
		_: string;
		DATABASE_URL: string;
		npm_config_prefix: string;
		npm_config_noproxy: string;
		HOSTNAME: string;
		SHLVL: string;
		PIP_DISABLE_PIP_VERSION_CHECK: string;
		npm_node_execpath: string;
		SMTP_PORT: string;
		npm_package_json: string;
		PS1: string;
		ENABLE_BROWSER: string;
		OLDPWD: string;
		NODE_MAJOR: string;
		npm_config_user_agent: string;
		RUNTIME: string;
		PWD: string;
		APP_PUBLIC_PORT: string;
		RUN_AS_OPENHANDS: string;
		LLM_LOG_COMPLETIONS: string;
		TERM_PROGRAM_VERSION: string;
		OR_APP_NAME: string;
		EDITOR: string;
		AGENT_ENABLE_BROWSING: string;
		PYTHONDONTWRITEBYTECODE: string;
		npm_config_init_module: string;
		LLM_BASE_URL: string;
		PYTHONUNBUFFERED: string;
		npm_config_cache: string;
		PATH: string;
		NODE: string;
		npm_package_name: string;
		INIT_CWD: string;
		SU_TO_USER: string;
		LANG: string;
		LLM_NATIVE_TOOL_CALLING: string;
		VSCODE_PORT: string;
		TERM_PROGRAM: string;
		npm_lifecycle_script: string;
		npm_config_node_gyp: string;
		SHELL: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
