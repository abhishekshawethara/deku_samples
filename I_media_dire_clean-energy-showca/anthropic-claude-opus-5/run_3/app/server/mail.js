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

async function send(log, { to, subject, text }) {
	try {
		const info = await transport.sendMail({ from, to, subject, text });
		log?.info?.({ event: 'mail_sent', to, subject, message_id: info.messageId });
		return true;
	} catch (err) {
		log?.error?.({ event: 'mail_failed', to, subject, error: String(err && err.message) });
		return false;
	}
}

export function mailEnquiry(log, { to, name, reference, topic }) {
	return send(log, {
		to,
		subject: `Enquiry received: ${reference}`,
		text: [
			`Hello ${name},`,
			'',
			`We have received your enquiry and logged it under reference ${reference}.`,
			`Topic: ${topic}`,
			'',
			`Quote the reference ${reference} in any follow up. A member of the team handling ${topic} enquiries will reply to this address.`,
			'',
			'Zettajoule'
		].join('\n')
	});
}

export function mailAccessRequest(log, { to, name, reference, organisation }) {
	return send(log, {
		to,
		subject: `Investor access requested: ${reference}`,
		text: [
			`Hello ${name},`,
			'',
			`Your request for access to the Zettajoule investor document room has been recorded under reference ${reference}.`,
			`Organisation: ${organisation}`,
			'',
			`The request is pending review. You will keep the reference ${reference} either way, and the document room opens for ${organisation} once the request is approved.`,
			'',
			'Zettajoule'
		].join('\n')
	});
}

export function mailApplication(log, { to, name, jobTitle, location }) {
	return send(log, {
		to,
		subject: `Application received: ${jobTitle}`,
		text: [
			`Hello ${name},`,
			'',
			`Thank you for applying for the role of ${jobTitle}.`,
			`Location: ${location}`,
			'',
			`Your application for ${jobTitle} in ${location} is with the hiring team. We read every note that reaches us and will reply to this address.`,
			'',
			'Zettajoule'
		].join('\n')
	});
}
