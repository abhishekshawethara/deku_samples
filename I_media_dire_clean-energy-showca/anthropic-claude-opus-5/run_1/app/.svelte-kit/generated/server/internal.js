
import root from '../root.js';
import { set_building, set_prerendering } from '$app/env/internal';
import { set_assets } from '$app/paths/internal/server';
import { set_manifest, set_read_implementation } from '__sveltekit/server';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';
import error from '../shared/error-template.js';

export const options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hash_routing: false,
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	service_worker_options: undefined,
	server_error_boundaries: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n<meta name=\"description\" content=\"Zettajoule builds small high-temperature gas-cooled reactor modules and sells the energy, not the reactor.\" />\n<title>Zettajoule</title>\n<link\nrel=\"icon\"\nhref=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cg fill='none' stroke='%23241f1c' stroke-width='1.8'%3E%3Cellipse cx='16' cy='16' rx='13.5' ry='5.5'/%3E%3Cellipse cx='16' cy='16' rx='13.5' ry='5.5' transform='rotate(60 16 16)'/%3E%3Cellipse cx='16' cy='16' rx='13.5' ry='5.5' transform='rotate(120 16 16)'/%3E%3C/g%3E%3Ccircle cx='16' cy='16' r='3.4' fill='%231f5fd0'/%3E%3C/svg%3E\"\n/>\n" + head + "\n</head>\n<body data-sveltekit-preload-data=\"hover\">\n<div style=\"display: contents\">" + body + "</div>\n</body>\n</html>\n",
		error
	},
	version_hash: "gd6vmm"
};

export async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	

	let reroute;
	let transport;
	

	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}

export { set_assets, set_building, set_manifest, set_prerendering, set_private_env, set_public_env, set_read_implementation };
