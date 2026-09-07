function line(obj) {
	process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
}

export const log = {
	info: (o) => line({ level: 'info', ...o }),
	warn: (o) => line({ level: 'warn', ...o }),
	error: (o) => line({ level: 'error', ...o })
};
