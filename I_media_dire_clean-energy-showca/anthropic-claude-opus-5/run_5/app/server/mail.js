import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'mailpit';
const port = Number(process.env.SMTP_PORT || 1025);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.MAIL_FROM || 'Zettajoule <no-reply@zettajoule.example>';

const transport = nodemailer.createTransport({
	host,
	port,
	secure: false,
	ignoreTLS: true,
	...(user || pass ? { auth: { user, pass } } : {})
});

export async function sendMail({ to, subject, text }, log) {
	try {
		const info = await transport.sendMail({ from, to, subject, text });
		log?.info({ event: 'mail_sent', to, subject, message_id: info.messageId });
		return true;
	} catch (err) {
		log?.error({ event: 'mail_failed', to, subject, error: String(err && err.message) });
		return false;
	}
}
