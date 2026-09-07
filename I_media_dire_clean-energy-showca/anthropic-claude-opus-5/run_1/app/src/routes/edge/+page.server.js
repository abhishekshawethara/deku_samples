import { copyFor } from '$lib/server/data.js';

export async function load() {
return { copy: await copyFor('edge') };
}
