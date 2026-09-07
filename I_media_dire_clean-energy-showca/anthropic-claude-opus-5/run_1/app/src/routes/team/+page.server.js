import { copyFor, getData } from '$lib/server/data.js';

export async function load() {
const [copy, team] = await Promise.all([copyFor('team'), getData('/api/team')]);
return { copy, team };
}
